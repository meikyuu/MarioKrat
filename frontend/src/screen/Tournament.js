import React from 'react';
import AddTournament from '../container/AddTournament';
import ViewTournament from '../container/ViewTournament';

export default function Home({ match }) {
    const { token } = match.params;
    if (token) {
        return <ViewTournament token={token} />;
    } else {
        return <AddTournament />;
    }
}
