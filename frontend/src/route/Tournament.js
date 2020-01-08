import React from 'react';
import TournamentAdd from '../screen/Tournament/Add';
import TournamentView from '../screen/Tournament/View';

export default function Home({ match }) {
    const { token } = match.params;
    if (token) {
        return <TournamentView token={token} />;
    } else {
        return <TournamentAdd />;
    }
}
