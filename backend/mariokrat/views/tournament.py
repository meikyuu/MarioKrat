from django.db.models import Q, Count
from django.http import JsonResponse

from asgiref.sync import async_to_sync
import channels.layers

from main.views import not_found_view
from utils.views import allow_methods, validate_body
from ..models import Tournament, Player, Race, Result
from ..schedule import schedule
from ..diff import diff

from is_valid import (
    is_str, is_list_of, is_pre, is_not_blank, is_decodable_json_where, is_int,
    is_in_range, is_dict_union,
)


POINTS = {
    1: 15,
    2: 12,
    3: 10,
    4: 8,
    5: 7,
    6: 6,
    7: 5,
    8: 4,
    9: 3,
    10: 2,
    11: 1,
    12: 0,
}


def add_ranks(scores, allow_equal=True):
    scores.sort(key=lambda score: score['points'], reverse=True)
    for i, score in enumerate(scores):
        while (
            allow_equal and
            i > 0 and
            score['points'] == scores[i - 1]['points']
        ):
            i -= 1
        score['rank'] = i + 1


def tournament_data(tournament, include_admin_token=False):
    next_race = None
    games = []

    for game in tournament.games.order_by('name'):
        players = list(game.players_in.order_by('position', 'id'))

        game_done = True
        active = all(slot.player is not None for slot in players)
        cups = []
        total = [{'player': i, 'points': 0} for i in range(len(players))]

        for cup in game.cups.order_by('number'):
            cup_done = True
            scores = [
                {'player': i, 'races': [], 'points': 0, 'fag_points': 0}
                for i in range(len(players))
            ]
            for race in cup.races.order_by('number'):
                for score in scores:
                    score['races'].append(None)
                for result in race.results.all():
                    player = players.index(result.slot)
                    scores[player]['races'][-1] = result.position
                    scores[player]['points'] += POINTS[result.position]
                if any(score['races'][-1] is None for score in scores):
                    game_done = False
                    cup_done = False
                    if active and (
                        next_race is None or
                        (game.round, cup.number) <
                        (next_race['round'], next_race['cup'])
                    ):
                        next_race = {
                            'round': game.round,
                            'game': game.name,
                            'cup': cup.number,
                            'race': race.number,
                        }
                else:
                    fag = max(
                        range(len(players)),
                        key=lambda player: scores[player]['races'][-1],
                    )
                    scores[fag]['fag_points'] += 2 if race.number == 4 else 1

            min_fag_points = min(score['fag_points'] for score in scores)
            max_fag_points = max(score['fag_points'] for score in scores)
            for score in scores:
                score['fag'] = (
                    min_fag_points < score['fag_points'] == max_fag_points
                )

            # If there is only one cup we do not allow ending on the same
            # position because we need clear rankings from that cup, otherwise
            # this is handled in the total rank
            add_ranks(scores, game.cups.count() != 1)
            cups.append(scores)

            for score in scores:
                total[score['player']]['points'] += score['points']
            if cup_done:
                for score in scores:
                    total[score['player']]['points'] += (
                        (len(players) - score['rank']) *
                        (POINTS[1] * cup.races.count())
                    )

        add_ranks(total, False)

        games.append({
            'name': game.name,
            'round': game.round,
            'state': (
                'done' if game_done else 'active' if active else 'waiting'
            ),
            'players': [
                {
                    'type': 'slot',
                    'game': slot.source.name,
                    'position': slot.position,
                    'player': slot.player and slot.player.number,
                }
                if slot.source else
                {
                    'type': 'player',
                    'player': slot.player.number,
                }
                for slot in players
            ],
            'cups': cups,
            'total': total,
        })

    if next_race:
        next_race.pop('round')

    data = {
        'token': tournament.spectator_token,
        'name': tournament.name,
        'players': [
            {
                'id': player.number,
                'name': player.name,
            }
            for player in tournament.players.order_by('number')
        ],
        'games': games,
        'ranks': [
            {
                'rank': slot.rank,
                'game': slot.source.name,
                'position': slot.position,
                'player': slot.player and slot.player.number,
            }
            for slot in tournament.slots.exclude(rank=None).order_by('rank')
        ],
        'next_race': next_race,
    }
    if include_admin_token:
        data['admin_token'] = tournament.admin_token
    return data


def tournament_view(request, token=None):
    if token is None:
        return tournament_list(request)
    else:
        return tournament_detail(request, token)


@allow_methods('POST')
@validate_body({
    'name': is_pre(is_str, is_not_blank),
    'players': is_list_of({
        'name': is_pre(is_str, is_not_blank),
    }),
})
def tournament_list(request, data):
    tournament = Tournament.objects.create(name=data['name'])
    for n, player_data in enumerate(data['players'], 1):
        Player.objects.create(
            tournament=tournament,
            number=n,
            name=player_data['name'],
        )

    schedule(tournament)

    return JsonResponse(tournament_data(tournament, True))


@allow_methods('GET', 'POST')
def tournament_detail(request, token):
    try:
        tournament = Tournament.objects.get(
            Q(admin_token=token) |
            Q(spectator_token=token)
        )
    except Tournament.DoesNotExist:
        return not_found_view(request)

    is_admin = token == tournament.admin_token

    data = tournament_data(tournament, is_admin)

    if request.method == 'POST':
        if not is_admin:
            return JsonResponse(
                status=405,
                data={
                    'code': 'MethodNotAllowed',
                    'message': 'Method not allowed.',
                },
            )

        game_preds = {}
        for game in tournament.games.exclude(players_in__player__isnull=True):
            race = (
                Race.objects
                .annotate(result_count=Count('results'))
                .filter(cup__game=game, result_count=0)
                .order_by('cup__number', 'number')
                .first()
            )

            if race:
                game_preds[game.name] = {
                    'cup': race.cup.number,
                    'race': race.number,
                    'positions': [
                        is_pre(is_int, is_in_range(1, 12, stop_in=True))
                        for _ in range(game.players_in.count())
                    ],
                }

        is_result = is_decodable_json_where(is_dict_union('game', game_preds))

        valid = is_result.explain(request.body)
        if not valid:
            return JsonResponse(
                status=400,
                data={
                    'code': 'BadRequest',
                    'message': 'Request body is not valid.',
                    'details': valid.dict(),
                },
            )

        race = Race.objects.get(
            cup__game__tournament=tournament,
            cup__game__name=valid.data['game'],
            cup__number=valid.data['cup'],
            number=valid.data['race'],
        )
        players = list(race.cup.game.players_in.order_by('position', 'id'))
        for player, position in zip(players, valid.data['positions']):
            Result.objects.create(
                race=race,
                slot=player,
                position=position,
            )

        new_data = tournament_data(tournament, is_admin)

        game_data = next(
            game_data
            for game_data in new_data['games']
            if game_data['name'] == valid.data['game']
        )
        if all(
            result is not None
            for cup_data in game_data['cups']
            for player_data in cup_data
            for result in player_data['races']
        ):
            for i, slot in enumerate(
                race.cup.game.players_out.order_by('position', 'id')
            ):
                slot.player = players[game_data['total'][i]['player']].player
                slot.save()

            new_data = tournament_data(tournament, is_admin)

        changes = list(diff(data, new_data))
        if changes:
            channel_layer = channels.layers.get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'tournament-{tournament.id}',
                {'type': 'tournament_changes', 'changes': changes},
            )

        data = new_data

    return JsonResponse(data)
