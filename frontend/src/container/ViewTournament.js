import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import api from '../api';
import Loader from '../component/Loader';
import theme from '../theme';
import Icon from '../component/Icon';

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const FlexContainer = styled.div`
    display: flex;
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
`;

const Game = styled.div`
    flex: 1 1;
    margin-left: 1rem;
    &:first-child {
        margin-left: 0;
    }
    
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 0.5rem;
    background-color: ${theme.bgColorP1};
    min-height: 8rem;
`;

const Rank = styled.div`
    flex: 1 1;
    margin-left: 1rem;
    &:first-child {
        margin-left: 0;
    }
    
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 0.5rem;
    background-color: ${theme.bgColorN1};
    min-height: 8rem;

    position: relative;
`;

const CornerIcon = styled(Icon)`
    position: absolute;
    margin: 0 !important;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 1.25rem;
`;

const trophyColors = {
    1: '#D0B040',
    2: '#B8C0C8',
    3: '#A07840',
};

function Slot({ slot, players }) {
    if (slot.player !== null) {
        return players.find(({ id }) => id === slot.player).name;
    } else {
        return `${slot.game}${slot.position}`;
    }
}

export default function ViewTournament({ token }) {
    const [tournament, setTournament] = useState(null);

    useEffect(() => {
        api.get(`tournament/${token}/`)
            .then((res) => setTournament(res.data))
            .catch((res) => {
                // TODO show errors
            });
    }, [token]);

    const rounds = useMemo(() => {
        if (tournament === null) {
            return null;
        }

        const gamesProcessed = {};
        const rounds = [];

        while (true) {
            const round = [];

            for (const game of tournament.games) {
                if (
                    !gamesProcessed[game.name] &&
                    game.players.every((slot) => (
                        slot.type === 'player' ||
                        (slot.type === 'slot' && gamesProcessed[slot.game])
                    ))
                ) {
                    round.push(game);
                }
            }

            if (round.length === 0) {
                break;
            } else {
                for (const game of round) {
                    gamesProcessed[game.name] = true;
                }
                rounds.push(round);
            }
        }

        return rounds;
    }, [tournament && tournament.games]);

    if (tournament === null) {
        return <Loader />;
    }

    return (
        <Container>
            <h1>{tournament.name}</h1>
            {rounds.map((round, i) => (
                <FlexContainer key={i}>
                    {round.map((game, i) => (
                        <Game key={i}>
                            <b>{game.name}:&nbsp;</b>
                            {game.players.map((slot, i) => (
                                <React.Fragment key={i}>
                                    {i !== 0 && ', '}
                                    <Slot
                                        slot={slot}
                                        players={tournament.players}
                                    />
                                </React.Fragment>
                            ))}
                        </Game>
                    ))}
                </FlexContainer>
            ))}
            <FlexContainer>
                {tournament.ranks.map((rank, i) => (
                    <Rank key={i}>
                        {trophyColors[rank.rank] && (
                            <CornerIcon
                                name="trophy"
                                color={trophyColors[rank.rank]}
                            />
                        )}
                        <b>{rank.rank}:&nbsp;</b>
                        <Slot
                            slot={rank}
                            players={tournament.players}
                        />
                    </Rank>
                ))}
            </FlexContainer>
        </Container>
    );
}
