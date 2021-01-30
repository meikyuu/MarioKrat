import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Icon from '../../component/Icon';
import Input from '../../component/Input';
import NumberInput from '../../component/NumberInput';
import Button from '../../component/Button';
import RadioButtons from '../../component/RadioButtons';
import Group from '../../component/Group';
import Collapsible from '../../component/Collapsible';
import Form from '../../component/Form';
import api from '../../api';

function getNextName(name) {
    if (/^Z+$/.test(name)) {
        return 'A'.repeat(name.length + 1);
    }

    let num = 0;
    for (let i = 0; i < name.length; i++) {
        num = num * 26 + name.codePointAt(i) - 'A'.codePointAt(0);
    }
    num++;

    let nextName = '';
    for (let i = 0; i < name.length; i++) {
        const charCode = num % 26;
        num = Math.floor(num / 26);
        nextName = String.fromCodePoint(charCode + 'A'.codePointAt(0)) + nextName;
    }
    return nextName;
}

export default function AddTournament() {
    const [name, setName] = useState('Mario Krat');
    const [players, setPlayers] = useState([
        { name: '' },
        { name: '' },
    ]);
    const [gameSize, setGameSize] = useState(4);
    const [gameCups, setGameCups] = useState(1);
    const [gameRaces, setGameRaces] = useState(4);
    const [shuffle, setShuffle] = useState(true);
    const playersRef = useRef(null);
    const history = useHistory();

    let playerNodes = players.map((player, i) => (
        <Input
            key={i}
            autoFocus={i === 0}
            placeholder={`Speler ${i + 1}`}
            value={player.name}
            onChange={(name) => setPlayers([
                ...players.slice(0, i),
                { ...player, name },
                ...players.slice(i + 1),
            ])}
            onDelete={players.length <= 2 ? undefined : () => setPlayers([
                ...players.slice(0, i),
                ...players.slice(i + 1),
            ])}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();

                    function focusNext() {
                        const node = playersRef.current;
                        node.children[i + 2].children[0].focus();
                    }

                    if (i === players.length - 1) {
                        setPlayers([...players, { name: '' }]);
                        setTimeout(focusNext, 0);
                    } else {
                        focusNext();
                    }
                } else if (
                    e.key === 'Backspace' &&
                    player.name === '' &&
                    players.length > 2
                ) {
                    e.preventDefault();

                    setPlayers([...players.slice(0, i), ...players.slice(i + 1)]);
                    const node = playersRef.current;
                    node.children[i === 0 ? i + 1 : i].children[0].focus();
                }
            }}
        />
    ));

    if (!shuffle) {
        const groups = Math.ceil(players.length / gameSize);
        const baseSize = Math.floor(players.length / groups);
        const extra = players.length % groups;
        const groupSizes = [];
        for (let i = 0; i < groups; i++) {
            groupSizes.push(baseSize + (i < extra ? 1 : 0));
        }
        const groupNodes = [];
        let offset = 0;
        let nextName = 'A';
        for (const groupSize of groupSizes) {
            groupNodes.push(
                <Group label={`Groep ${nextName}`}>
                    {playerNodes.slice(offset, offset + groupSize)}
                </Group>
            );
            offset += groupSize;
            nextName = getNextName(nextName);
        }
        playerNodes = groupNodes;
    }

    return (
        <>
            <h2>Nieuw Toernooi</h2>
            <Form onSubmit={(e) => {
                e.preventDefault();

                api.post('tournament/', {
                    name,
                    players,
                    game_size: gameSize,
                    game_cups: gameCups,
                    game_races: gameRaces,
                    shuffle,
                })
                .then(({ data: { admin_token } }) => {
                    history.push(`/t/${admin_token}`);
                })
                .catch((res) => {
                    // TODO show errors
                });
            }}>
                <Group label="Naam">
                    <Input
                        placeholder="Naam"
                        value={name}
                        onChange={setName}
                    />
                </Group>
                <Group label="Spelers" innerRef={playersRef}>
                    {playerNodes}
                    <Button onClick={() => setPlayers([...players, { name: '' }])}>
                        Speler Toevoegen
                    </Button>
                </Group>
                <Button primary type="submit">Toernooi Aanmaken</Button>
                <Collapsible label={<><Icon name="cog"/> Instellingen</>}>
                    <Group label="Cups per Ronde">
                        <NumberInput
                            placeholder="Cups per Ronde"
                            value={gameCups}
                            onChange={setGameCups}
                        />
                    </Group>
                    <Group label="Races per Cup">
                        <NumberInput
                            placeholder="Races per Cup"
                            value={gameRaces}
                            onChange={setGameRaces}
                        />
                    </Group>
                    <Group label="Max Spelers per Groep">
                        <NumberInput
                            placeholder="Max Spelers per Groep"
                            value={gameSize}
                            onChange={setGameSize}
                        />
                    </Group>
                    <Group label="Willekeurige Groepsindeling">
                        <RadioButtons
                            value={shuffle}
                            onChange={setShuffle}
                            options={[
                                { value: true, icon: 'check', content: 'Ja' },
                                { value: false, icon: 'times', content: 'Nee' },
                            ]}
                        />
                    </Group>
                </Collapsible>
            </Form>
        </>
    );
}
