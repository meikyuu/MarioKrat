import React from 'react';
import styled from 'styled-components';

const Content = styled.p`
    text-align: center;
`;

export default function Error404({ location }) {
    return (
        <Content>Page Not Found: <tt>{location.pathname}</tt></Content>
    );
}
