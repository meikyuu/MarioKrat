import React, { useState, useContext, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../../api';
import Modal from '../../../component/Modal';
import Group from '../../../component/Group';
import RadioButtons from '../../../component/RadioButtons';
import Button from '../../../component/Button';
import range from '../../../helpers/range';
import theme from '../../../theme';
import Slot from './Slot';
import TournamentContext from './Context';

const PositionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
`;

const PositionContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const PositionNumber = styled.div`
    font-weight: bold;
    width: 1rem;
    text-align: right;
    flex: 0 0 auto;
    margin-right: 0.8rem;
`;

const PositionPlayer = styled.div`
    flex: 1 1 auto;
    background-color: ${({ active }) => active ? theme.bgColorP1 : theme.bgColorN1};
    color: ${theme.textColor};
    font-weight: bold;
    padding: 0.4rem;
    text-align: center;
    border-radius: 0.4rem;
    height: 1.8rem;
    line-height: 1rem;
    ${({ active }) => active ? `
        cursor: grab;
        touch-action: none;
    ` : ``}
    ${({ x, y, width }) => x !== undefined && y !== undefined && width !== undefined ? `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        pointer-events: none;
    ` : ``}
`;

export default function ResultModal({ onClose, onChangeTournament, ...props }) {
    const { admin_token, next_race, games } = useContext(TournamentContext);
    const [results, setResults] = useState([]);
    const [drag, setDrag] = useState(null);

    const game = useMemo(
        () => games.find(({ name }) => name === next_race.game),
        [games, next_race],
    );

    useEffect(
        () => setResults(range(1, game.players.length + 1)),
        [game, next_race],
    );

    useEffect(
        () => {
            if (drag) {
                function onMouseMove(e) {
                    e.preventDefault();
                    const { clientX, clientY } = e.changedTouches ? e.changedTouches[0] : e;
                    setDrag({ ...drag, mouseX: clientX, mouseY: clientY });
                }

                function onMouseUp(e) {
                    if (e.button === undefined || e.button === 0) {
                        e.preventDefault();

                        let { position } = (
                            e.touches
                            ? document.elementFromPoint(drag.mouseX, drag.mouseY)
                            : e.target
                        ).dataset;
                        if (position !== undefined) {
                            position = parseInt(position);

                            const newResults = results.slice();
                            const player = results.indexOf(position);
                            if (player !== -1) {
                                newResults[player] = drag.position;
                            }
                            newResults[drag.player] = position;
                            setResults(newResults);
                        }

                        setDrag(null);
                    }
                }

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
                window.addEventListener('touchmove', onMouseMove);
                window.addEventListener('touchend', onMouseUp);
                return () => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                    window.removeEventListener('touchmove', onMouseMove);
                    window.removeEventListener('touchend', onMouseUp);
                };
            }
        },
        [results, drag],
    );

    return (
        <Modal title="Resultaat" onClose={onClose} {...props}>
            <PositionsContainer>
                {range(1, 13).map((position) => {
                    const player = results.indexOf(position);
                    const slot = (
                        player === -1 || (drag && player === drag.player)
                        ? null
                        : game.players[player]
                    );

                    function onMouseDown(e) {
                        if (e.button === undefined || e.button === 0) {
                            e.preventDefault();
                            const { x, y, width } = e.target.getBoundingClientRect();
                            const { clientX, clientY } = e.changedTouches ? e.changedTouches[0] : e;
                            setDrag({
                                position,
                                player,
                                width,
                                offsetX: x - clientX,
                                offsetY: y - clientY,
                                mouseX: clientX,
                                mouseY: clientY,
                            });
                        }
                    }

                    return (
                        <PositionContainer key={position}>
                            <PositionNumber>{position}</PositionNumber>
                            <PositionPlayer
                                active={!!slot}
                                data-position={position}
                                onMouseDown={slot ? onMouseDown : undefined}
                                onTouchStart={slot ? onMouseDown : undefined}
                            >
                                {slot && <Slot slot={slot} />}
                            </PositionPlayer>
                        </PositionContainer>
                    );
                })}
                {drag && (
                    <PositionPlayer active
                        x={drag.mouseX + drag.offsetX} 
                        y={drag.mouseY + drag.offsetY} 
                        width={drag.width}
                    >
                        <Slot slot={game.players[drag.player]} />
                    </PositionPlayer>
                )}
            </PositionsContainer>
            <Button primary
                icon="check"
                onClick={() => (
                    api.post(`tournament/${admin_token}/`, { ...next_race, positions: results })
                    .then((res) => onChangeTournament(res.data))
                )}
            >
                Bevestigen
            </Button>
        </Modal>
    );
}
