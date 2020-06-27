import React, { useState } from 'react';
import styled from 'styled-components';
import useLocalState from '../../helpers/useLocalState';
import theme from '../../theme';
import Button from '../../component/Button';
import Modal from '../../component/Modal';

const NoCard = styled.p`
    font-style: italic;
    text-align: center;
    color: ${theme.textColorN2};
    margin: 2rem 0;
`;

const CenteredP = styled.p`
    text-align: center;
`;

const Cards = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: auto;
    grid-gap: 0.5rem;
    margin-bottom: 1rem;
`;

const Card = styled.div`
    position: relative;
    border-radius: 0.5rem;
    cursor: pointer;
    ${({ checked }) => checked ? `
        background-color: ${theme.bgColorN1};
        color: ${theme.bgColorP2};
        text-decoration: line-through;
        transform: scale(0.95);
    ` : `
        background-color: ${theme.bgColorP1};
        color: ${theme.textColorP2};
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.125);
    `}
    transition:
        background-color 300ms ease,
        color 300ms ease,
        transform 300ms ease,
        box-shadow 300ms ease;
    &:after {
        content: '';
        display: block;
        padding-bottom: 100%;
    }
    > * {
        z-index: 1;
        position: absolute;
        left: 0.25rem;
        top: 50%;
        width: calc(100% - 0.5rem);
        transform: translateY(-50%);
        text-align: center;
        font-size: 0.66rem;
    }
`;

const Bingo = styled.span`
    z-index: 2;
    font-weight: bold;
    font-size: 4rem;
    color: ${theme.primaryColor};
    left: -0.25rem;
    top: -0.25rem;
    width: unset;
    ${({ active }) => active ? `
        transform: translate(-50%, -50%) rotate(10deg);
    ` : `
        transform: translate(-50%, -50%) rotate(-80deg) scale(0);
        opacity: 0;
    `};
    transition: transform 1200ms ease, opacity 1200ms ease;
`;

const ITEMS = [
    'Jip maakt bezwaar tegen de Jip Bingo ',
    'Jip zegt \'heeeeey\' als ie beledigd wordt',
    'Jip valt van z\'n kratje af',
    'Jip zegt \'boom\'',
    'Jip doet kroegbaas Jolke na',
    'Jip zegt \'prank\'',
    'Jip gaat FUT doen op z\'n telefoon',
    'Jip is moe en zegt langer dan 15 minuten niks',
    'Jip zegt \'padiedadida\'',
    'Jip maakt een gay opmerking',
    'Jip maakt een \'grappige\' opmerking waarna er een stilte valt',
    'Jip vergeet te vloggen na dat z\'n biertje op is',
    'Jip noemt iemand anders dik',
    'Jip beledigt zichzelf',
    'Jip zegt dat hij zin heeft in dat de sportscholen weer open gaan',
    'Jip zegt dat hij zin in heeft in een wedstrijd van Ajax',
    'Jip zegt hoeveel kilo hij al is afgevallen',
    'Jip zegt \'lekker smikkelen\'',
    'Jip zegt \'boeboebaba\'',
    'Jip zegt \'ik luister de laatste tijd echt veel franse muziek\'',
    'Jip zegt hoe leuk hij oostblok landen vind',
    'Jip trekt een adtje',
    'Jip zegt dat hij de nummer 1 adter is van KSV',
    'Jip doet de Griezmann celebration',
    'Jip geeft een knipoog kus',
    'Jip heeft technische problemen ',
    'Jip wordt geiced',
    'Jip zegt \'siiiiiu\'',
    'Jip zegt \'wanker\' inclusief bijbehorend gebaar',
    'Jip begint over een meid op tinder',
    'Jip gaat tinderen tijdens adtje kratje',
    'Jip ontkent dat ie al een knuffelmaatje heeft',
];

export default function JipBingo() {
    const [cards, setCards] = useLocalState('jip-bingo-cards', null);
    const [randomOpen, setRandomOpen] = useState(false);

    function setRandomCards() {
        const cards = ITEMS.map((text) => ({ text, checked: false }));
        while (cards.length > 16) {
            const i = Math.floor(Math.random() * cards.length);
            cards.splice(i, 1);
        }
        setCards(cards);
    }

    return (
        <>
            <h2>Jip Bingo</h2>
            {cards === null ? (
                <NoCard>Je hebt nog geen bingokaart.</NoCard>
            ) : (
                <Cards>{cards.map(({ text, checked }, i) => (
                    <Card key={i} checked={checked} onClick={() => setCards([
                        ...cards.slice(0, i),
                        { ...cards[i], checked: !checked },
                        ...cards.slice(i + 1),
                    ])}>
                        {i === 10 && (
                            <Bingo active={cards.every(({ checked }) => checked)}>
                                Bingo!
                            </Bingo>
                        )}
                        <div>{text}</div>
                    </Card>
                ))}</Cards>
            )}
            <Button icon="random" onClick={cards === null ? setRandomCards : () => setRandomOpen(true)}>
                Random Kaart
            </Button>
            <Modal title="Random Kaart" open={randomOpen} onClose={() => setRandomOpen(false)}>
                <CenteredP>Weet je zeker dat je huidige kaart weg wilt gooien?</CenteredP>
                <Button onClick={() => {
                    setRandomCards();
                    setRandomOpen(false);
                }}>Ja</Button>
            </Modal>
        </>
    );
}
