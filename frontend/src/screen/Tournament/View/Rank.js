import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Icon from '../../../component/Icon';
import Slot from './Slot';

const Container = styled.div`
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

const TrophyIcon = styled(Icon)`
    position: absolute;
    margin: 0 !important;
    top: 1rem;
    left: 50%;
    font-size: 1.25rem;
    transform: translateX(-50%);
`;

const trophyColors = {
    1: '#D0B040',
    2: '#B8C0C8',
    3: '#A07840',
};

export default function Rank({ rank }) {
    return (
        <Container>
            {trophyColors[rank.rank] && (
                <TrophyIcon
                    name="trophy"
                    color={trophyColors[rank.rank]}
                />
            )}
            <b>{rank.rank}:&nbsp;</b>
            <Slot slot={rank} />
        </Container>
    );
}
