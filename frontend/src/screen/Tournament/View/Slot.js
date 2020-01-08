import { useContext } from 'react';
import TournamentContext from './Context';

export default function Slot({ slot }) {
    const { players } = useContext(TournamentContext);

    if (slot.player !== null) {
        return players.find(({ id }) => id === slot.player).name;
    } else {
        return `${slot.game}${slot.position}`;
    }
}
