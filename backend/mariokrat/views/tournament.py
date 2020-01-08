from django.db.models import Q
from django.http import JsonResponse

from main.views import not_found_view
from utils.views import allow_methods, validate_body
from ..models import Tournament, Player
from ..schedule import schedule

from is_valid import is_str, is_list_of, is_pre, is_not_blank


def tournament_data(tournament, include_admin_token=False):
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
        'games': [
            {
                'name': game.name,
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
                    for slot in game.players_in.order_by('id')
                ],
            }
            for game in tournament.games.order_by('name')
        ],
        'ranks': [
            {
                'rank': slot.rank,
                'game': slot.source.name,
                'position': slot.position,
                'player': slot.player and slot.player.number,
            }
            for slot in tournament.slots.exclude(rank=None).order_by('rank')
        ],
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


@allow_methods('GET')
def tournament_detail(request, token):
    try:
        tournament = Tournament.objects.get(
            Q(admin_token=token) |
            Q(spectator_token=token)
        )
    except Tournament.DoesNotExist:
        return not_found_view(request)

    is_admin = token == tournament.admin_token

    return JsonResponse(tournament_data(tournament, is_admin))
