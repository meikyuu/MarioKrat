from django.test import TestCase

from ..models import Tournament, Player
from ..schedule import schedule


class TestSchedule(TestCase):

    def test_schedule_8_players(self):
        tournament = Tournament.objects.create(
            name='Tournament',
            game_size=4,
            game_cups=2,
            game_races=4,
        )
        players = [
            Player.objects.create(
                tournament=tournament,
                number=n,
                name=f'Player {n}',
            )
            for n in range(1, 9)
        ]

        schedule(tournament, shuffle=False)

        # Get all expected games
        self.assertEqual(tournament.games.count(), 4)
        game_a = tournament.games.get(name='A')
        game_b = tournament.games.get(name='B')
        game_c = tournament.games.get(name='C')
        game_d = tournament.games.get(name='D')

        # Game A
        self.assertEqual(game_a.players_in.count(), 4)
        self.assertEqual(game_a.players_out.count(), 4)
        self.assertTrue(
            game_a.players_in
            .filter(player=players[0])
            .exists()
        )
        self.assertTrue(
            game_a.players_in
            .filter(player=players[1])
            .exists()
        )
        self.assertTrue(
            game_a.players_in
            .filter(player=players[2])
            .exists()
        )
        self.assertTrue(
            game_a.players_in
            .filter(player=players[3])
            .exists()
        )

        # Game B
        self.assertEqual(game_b.players_in.count(), 4)
        self.assertEqual(game_b.players_out.count(), 4)
        self.assertTrue(
            game_b.players_in
            .filter(player=players[4])
            .exists()
        )
        self.assertTrue(
            game_b.players_in
            .filter(player=players[5])
            .exists()
        )
        self.assertTrue(
            game_b.players_in
            .filter(player=players[6])
            .exists()
        )
        self.assertTrue(
            game_b.players_in
            .filter(player=players[7])
            .exists()
        )
        self.assertEqual(game_b.players_out.count(), 4)

        # Game C
        self.assertEqual(game_c.players_in.count(), 4)
        self.assertEqual(game_c.players_in.count(), 4)
        self.assertTrue(
            game_c.players_in
            .filter(source=game_a, position=1)
            .exists()
        )
        self.assertTrue(
            game_c.players_in
            .filter(source=game_b, position=1)
            .exists()
        )
        self.assertTrue(
            game_c.players_in
            .filter(source=game_a, position=2)
            .exists()
        )
        self.assertTrue(
            game_c.players_in
            .filter(source=game_b, position=2)
            .exists()
        )

        # Game D
        self.assertEqual(game_d.players_in.count(), 4)
        self.assertEqual(game_d.players_in.count(), 4)
        self.assertTrue(
            game_d.players_in
            .filter(source=game_a, position=3)
            .exists()
        )
        self.assertTrue(
            game_d.players_in
            .filter(source=game_b, position=3)
            .exists()
        )
        self.assertTrue(
            game_d.players_in
            .filter(source=game_a, position=4)
            .exists()
        )
        self.assertTrue(
            game_d.players_in
            .filter(source=game_b, position=4)
            .exists()
        )

        # Ranks
        self.assertTrue(game_c.players_out.filter(position=1, rank=1).exists())
        self.assertTrue(game_c.players_out.filter(position=2, rank=2).exists())
        self.assertTrue(game_c.players_out.filter(position=3, rank=3).exists())
        self.assertTrue(game_c.players_out.filter(position=4, rank=4).exists())
        self.assertTrue(game_d.players_out.filter(position=1, rank=5).exists())
        self.assertTrue(game_d.players_out.filter(position=2, rank=6).exists())
        self.assertTrue(game_d.players_out.filter(position=3, rank=7).exists())
        self.assertTrue(game_d.players_out.filter(position=4, rank=8).exists())
