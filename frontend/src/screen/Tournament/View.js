import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import api from '../../api';
import theme from '../../theme';
import Loader from '../../component/Loader';
import Icon from '../../component/Icon';
import Game from './View/Game';
import Rank from './View/Rank';
import ShareModal from './View/ShareModal';
import TournamentContext from './View/Context';

const Container = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    ${({ blur }) => blur ? `
        filter: blur(8px);
    ` : ``}
`;

const FlexContainer = styled.div`
    display: flex;
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
`;

const ShareIcon = styled(Icon)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.25rem;
    cursor: pointer;
    color: ${theme.textColor};
    &:hover {
        color: ${theme.textColorP1};
    }
    transition: color 300ms ease;
`;

export default function ViewTournament({ token }) {
    const [tournament, setTournament] = useState(null);
    const [share, setShare] = useState(false);

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
    }, [tournament]);

    if (tournament === null) {
        return <Loader />;
    }

    return (
        <TournamentContext.Provider value={tournament}>
            <Container blur={share}>
                <h1>{tournament.name}</h1>
                {rounds.map((round, i) => (
                    <FlexContainer key={i}>
                        {round.map((game, i) => (
                            <Game key={i} game={game} players={tournament.players} />
                        ))}
                    </FlexContainer>
                ))}
                <FlexContainer>
                    {tournament.ranks.map((rank, i) => (
                        <Rank key={i} rank={rank} players={tournament.players} />
                    ))}
                </FlexContainer>
                <ShareIcon name="share" onClick={() => setShare(true)} />
            </Container>
            <ShareModal
                open={share}
                onClose={() => setShare(false)}
            />
        </TournamentContext.Provider>
    );
}
