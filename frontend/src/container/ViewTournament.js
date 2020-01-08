import React, { useState, useEffect } from 'react';
import api from '../api';
import Loader from '../component/Loader';

export default function ViewTournament({ token }) {
    const [tournament, setTournament] = useState(null);

    useEffect(() => {
        api.get(`tournament/${token}/`)
            .then((res) => setTournament(res.data))
            .catch((res) => {
                // TODO show errors
            });
    }, [token]);

    if (tournament === null) {
        return <Loader />;
    }

    return JSON.stringify(tournament);
}
