import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import Modal from '../../../component/Modal';
import RadioButtons from '../../../component/RadioButtons';
import Icon from '../../../component/Icon';
import Input from '../../../component/Input';
import HSplit from '../../../component/HSplit';
import Button from '../../../component/Button';
import TournamentContext from './Context';

const TYPE_OPTIONS = [
    { 
        value: 'spectator',
        icon: 'eye',
        content: 'Toeschouwer',
    },
    {
        value: 'referee',
        icon: 'pen',
        content: 'Scheidsrechter',
    },
];

export default function ShareModal(props) {
    const [type, setType] = useState('spectator');
    const { name, token, admin_token } = useContext(TournamentContext);

    const url = `${window.location.origin}/t/${type === 'referee' && admin_token ? admin_token : token}`;
    const subject = `Uitnodiging voor ${name}`;
    const body = `Ik wil je graag uitnodigen voor ${name}. Volg de link: ${url}`;

    return (
        <Modal title="Delen" {...props}>
            {admin_token && (
                <RadioButtons
                    value={type}
                    onChange={setType}
                    options={TYPE_OPTIONS}
                />
            )}
            <Input copy readonly value={url} />
            <HSplit>
                <Button
                    as="a"
                    color="#3880A8" hoverColor="#286078"
                    href={`mailto:?subject=${encodeURI(subject)}&body=${encodeURI(body)}`}
                    target="_blank"
                    icon="envelope"
                >
                    Mail
                </Button>
                <Button
                    as="a"
                    color="#128C7E" hoverColor="#075E54"
                    href={`https://api.whatsapp.com/send?text=${encodeURI(body)}`}
                    target="_blank"
                    icon={{ set: 'brands', name: 'whatsapp', size: '1.1em' }}
                >
                    WhatsApp
                </Button>
            </HSplit>
        </Modal>
    );
}
