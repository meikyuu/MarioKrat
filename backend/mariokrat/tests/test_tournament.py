from django.test import TestCase, Client

from is_valid import (
    is_decodable_json_where, is_str, is_list_of, is_dict_union, is_int, is_in,
    is_nullable, is_bool,
)
from is_valid.test import assert_valid

from ..models import Tournament, Player
from ..schedule import schedule


class TestTournament(TestCase):

    def setUp(self):
        self.client = Client()

    def test_create_tournament(self):
        res = self.client.post(
            '/api/tournament/',
            {
                'name': 'Tournament',
                'players': [
                    {'name': f'Player {n}'}
                    for n in range(1, 9)
                ],
            },
            content_type='application/json',
        )

        self.assertEqual(res.status_code, 200)
        assert_valid(res.content, is_decodable_json_where({
            'name': 'Tournament',
            'token': is_str,
            'admin_token': is_str,
            'players': is_list_of({
                'id': is_int,
                'name': is_str,
            }),
            'games': is_list_of({
                'name': is_str,
                'round': is_int,
                'state': is_in({'waiting', 'active', 'done'}),
                'players': is_list_of(is_dict_union(
                    player={
                        'player': is_int,
                    },
                    slot={
                        'game': is_str,
                        'position': is_in({1, 2, 3, 4}),
                        'player': None,
                    },
                )),
                'cups': is_list_of(
                    is_list_of({
                        'player': is_int,
                        'races': is_list_of(is_nullable(is_int)),
                        'points': is_int,
                        'rank': is_in({1, 2, 3, 4}),
                        'fag_points': is_int,
                        'fag': is_bool,
                    }),
                ),
                'total': is_list_of({
                    'player': is_int,
                    'points': is_int,
                    'rank': is_in({1, 2, 3, 4}),
                }),
            }),
            'next_race': is_nullable({
                'game': is_str,
                'cup': is_int,
                'race': is_int,
            }),
            'ranks': is_list_of({
                'rank': is_in({1, 2, 3, 4, 5, 6, 7, 8}),
                'game': is_str,
                'position': is_in({1, 2, 3, 4}),
                'player': None,
            }),
        }))

    def test_perform_tournament(self):
        tournament = Tournament.objects.create(name='Tournament')
        for n in range(1, 5):
            Player.objects.create(
                tournament=tournament,
                number=n,
                name=f'Player {n}',
            )
        schedule(tournament, shuffle=False)

        url = f'/api/tournament/{tournament.admin_token}/'

        def assert_tournament_state(
            content, cups, total, next_race, ranks, state='active',
        ):
            assert_valid(content, is_decodable_json_where({
                'name': 'Tournament',
                'token': is_str,
                'admin_token': is_str,
                'players': [
                    {'id': 1, 'name': 'Player 1'},
                    {'id': 2, 'name': 'Player 2'},
                    {'id': 3, 'name': 'Player 3'},
                    {'id': 4, 'name': 'Player 4'},
                ],
                'games': [{
                    'name': 'A',
                    'round': 1,
                    'state': state,
                    'players': [
                        {'type': 'player', 'player': 1},
                        {'type': 'player', 'player': 2},
                        {'type': 'player', 'player': 3},
                        {'type': 'player', 'player': 4},
                    ],
                    'cups': cups,
                    'total': total,
                }],
                'next_race': next_race,
                'ranks': ranks,
            }))

        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        assert_tournament_state(
            res.content,
            cups=[
                [
                    {
                        'player': 0,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                ],
                [
                    {
                        'player': 0,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                ],
            ],
            total=[
                {'player': 0, 'points': 0, 'rank': 1},
                {'player': 1, 'points': 0, 'rank': 2},
                {'player': 2, 'points': 0, 'rank': 3},
                {'player': 3, 'points': 0, 'rank': 4},
            ],
            next_race={'game': 'A', 'cup': 1, 'race': 1},
            ranks=[
                {'rank': 1, 'game': 'A', 'position': 1, 'player': None},
                {'rank': 2, 'game': 'A', 'position': 2, 'player': None},
                {'rank': 3, 'game': 'A', 'position': 3, 'player': None},
                {'rank': 4, 'game': 'A', 'position': 4, 'player': None},
            ],
        )

        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 1,
                'race': 1,
                'positions': [1, 2, 3, 4],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        assert_tournament_state(
            res.content,
            cups=[
                [
                    {
                        'player': 0,
                        'races': [1, None, None, None],
                        'points': 15,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [2, None, None, None],
                        'points': 12,
                        'rank': 2,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [3, None, None, None],
                        'points': 10,
                        'rank': 3,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [4, None, None, None],
                        'points': 8,
                        'rank': 4,
                        'fag_points': 1,
                        'fag': True,
                    },
                ],
                [
                    {
                        'player': 0,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                ],
            ],
            total=[
                {'player': 0, 'points': 15, 'rank': 1},
                {'player': 1, 'points': 12, 'rank': 2},
                {'player': 2, 'points': 10, 'rank': 3},
                {'player': 3, 'points': 8, 'rank': 4},
            ],
            next_race={'game': 'A', 'cup': 1, 'race': 2},
            ranks=[
                {'rank': 1, 'game': 'A', 'position': 1, 'player': None},
                {'rank': 2, 'game': 'A', 'position': 2, 'player': None},
                {'rank': 3, 'game': 'A', 'position': 3, 'player': None},
                {'rank': 4, 'game': 'A', 'position': 4, 'player': None},
            ],
        )

        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 1,
                'race': 2,
                'positions': [12, 11, 10, 9],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        assert_tournament_state(
            res.content,
            cups=[
                [
                    {
                        'player': 0,
                        'races': [1, 12, None, None],
                        'points': 15,
                        'rank': 1,
                        'fag_points': 1,
                        'fag': True,
                    },
                    {
                        'player': 1,
                        'races': [2, 11, None, None],
                        'points': 13,
                        'rank': 2,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [3, 10, None, None],
                        'points': 12,
                        'rank': 3,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [4, 9, None, None],
                        'points': 11,
                        'rank': 4,
                        'fag_points': 1,
                        'fag': True,
                    },
                ],
                [
                    {
                        'player': 0,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                ],
            ],
            total=[
                {'player': 0, 'points': 15, 'rank': 1},
                {'player': 1, 'points': 13, 'rank': 2},
                {'player': 2, 'points': 12, 'rank': 3},
                {'player': 3, 'points': 11, 'rank': 4},
            ],
            next_race={'game': 'A', 'cup': 1, 'race': 3},
            ranks=[
                {'rank': 1, 'game': 'A', 'position': 1, 'player': None},
                {'rank': 2, 'game': 'A', 'position': 2, 'player': None},
                {'rank': 3, 'game': 'A', 'position': 3, 'player': None},
                {'rank': 4, 'game': 'A', 'position': 4, 'player': None},
            ],
        )

        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 1,
                'race': 3,
                'positions': [8, 1, 11, 4],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        assert_tournament_state(
            res.content,
            cups=[
                [
                    {
                        'player': 1,
                        'races': [2, 11, 1, None],
                        'points': 28,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 0,
                        'races': [1, 12, 8, None],
                        'points': 19,
                        'rank': 2,
                        'fag_points': 1,
                        'fag': True,
                    },
                    {
                        'player': 3,
                        'races': [4, 9, 4, None],
                        'points': 19,
                        'rank': 2,
                        'fag_points': 1,
                        'fag': True,
                    },
                    {
                        'player': 2,
                        'races': [3, 10, 11, None],
                        'points': 13,
                        'rank': 4,
                        'fag_points': 1,
                        'fag': True,
                    },
                ],
                [
                    {
                        'player': 0,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                ],
            ],
            total=[
                {'player': 1, 'points': 28, 'rank': 1},
                {'player': 0, 'points': 19, 'rank': 2},
                {'player': 3, 'points': 19, 'rank': 3},
                {'player': 2, 'points': 13, 'rank': 4},
            ],
            next_race={'game': 'A', 'cup': 1, 'race': 4},
            ranks=[
                {'rank': 1, 'game': 'A', 'position': 1, 'player': None},
                {'rank': 2, 'game': 'A', 'position': 2, 'player': None},
                {'rank': 3, 'game': 'A', 'position': 3, 'player': None},
                {'rank': 4, 'game': 'A', 'position': 4, 'player': None},
            ],
        )

        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 1,
                'race': 4,
                'positions': [2, 5, 10, 3],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        assert_tournament_state(
            res.content,
            cups=[
                [
                    {
                        'player': 1,
                        'races': [2, 11, 1, 5],
                        'points': 35,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 0,
                        'races': [1, 12, 8, 2],
                        'points': 31,
                        'rank': 2,
                        'fag_points': 1,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [4, 9, 4, 3],
                        'points': 29,
                        'rank': 3,
                        'fag_points': 1,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [3, 10, 11, 10],
                        'points': 15,
                        'rank': 4,
                        'fag_points': 3,
                        'fag': True,
                    },
                ],
                [
                    {
                        'player': 0,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [None, None, None, None],
                        'points': 0,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                ],
            ],
            total=[
                {'player': 1, 'points': 180 + 35, 'rank': 1},
                {'player': 0, 'points': 120 + 31, 'rank': 2},
                {'player': 3, 'points': 60 + 29, 'rank': 3},
                {'player': 2, 'points': 0 + 15, 'rank': 4},
            ],
            next_race={'game': 'A', 'cup': 2, 'race': 1},
            ranks=[
                {'rank': 1, 'game': 'A', 'position': 1, 'player': None},
                {'rank': 2, 'game': 'A', 'position': 2, 'player': None},
                {'rank': 3, 'game': 'A', 'position': 3, 'player': None},
                {'rank': 4, 'game': 'A', 'position': 4, 'player': None},
            ],
        )

        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 2,
                'race': 1,
                'positions': [1, 5, 2, 3],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 2,
                'race': 2,
                'positions': [5, 4, 1, 2],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 2,
                'race': 3,
                'positions': [2, 1, 4, 5],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        res = self.client.post(
            url,
            data={
                'game': 'A',
                'cup': 2,
                'race': 4,
                'positions': [2, 6, 3, 4],
            },
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        assert_tournament_state(
            res.content,
            cups=[
                [
                    {
                        'player': 1,
                        'races': [2, 11, 1, 5],
                        'points': 35,
                        'rank': 1,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 0,
                        'races': [1, 12, 8, 2],
                        'points': 31,
                        'rank': 2,
                        'fag_points': 1,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [4, 9, 4, 3],
                        'points': 29,
                        'rank': 3,
                        'fag_points': 1,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [3, 10, 11, 10],
                        'points': 15,
                        'rank': 4,
                        'fag_points': 3,
                        'fag': True,
                    },
                ],
                [
                    {
                        'player': 0,
                        'races': [1, 5, 2, 2],
                        'points': 46,
                        'rank': 1,
                        'fag_points': 1,
                        'fag': False,
                    },
                    {
                        'player': 2,
                        'races': [2, 1, 4, 3],
                        'points': 45,
                        'rank': 2,
                        'fag_points': 0,
                        'fag': False,
                    },
                    {
                        'player': 3,
                        'races': [3, 2, 5, 4],
                        'points': 37,
                        'rank': 3,
                        'fag_points': 1,
                        'fag': False,
                    },
                    {
                        'player': 1,
                        'races': [5, 4, 1, 6],
                        'points': 36,
                        'rank': 4,
                        'fag_points': 3,
                        'fag': True,
                    },
                ],
            ],
            total=[
                {'player': 0, 'points': 120 + 31 + 180 + 46, 'rank': 1},
                {'player': 1, 'points': 180 + 35 + 0 + 36, 'rank': 2},
                {'player': 3, 'points': 60 + 29 + 60 + 37, 'rank': 3},
                {'player': 2, 'points': 0 + 15 + 120 + 45, 'rank': 4},
            ],
            next_race=None,
            ranks=[
                {'rank': 1, 'game': 'A', 'position': 1, 'player': 1},
                {'rank': 2, 'game': 'A', 'position': 2, 'player': 2},
                {'rank': 3, 'game': 'A', 'position': 3, 'player': 4},
                {'rank': 4, 'game': 'A', 'position': 4, 'player': 3},
            ],
            state='done',
        )
