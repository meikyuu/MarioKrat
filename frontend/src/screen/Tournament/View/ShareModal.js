import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import Modal from '../../../component/Modal';
import RadioButtons from '../../../component/RadioButtons';
import Icon from '../../../component/Icon';
import Input from '../../../component/Input';
import HSplit from '../../../component/HSplit';
import { ButtonA } from '../../../component/Button';
import TournamentContext from './Context';

const ButtonIcon = styled(Icon)`
    font-size: ${({ size = '0.9em' }) => size};
    line-height: 1;
    position: absolute;
    left: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
`;

const TYPE_OPTIONS = [
    { 
        value: 'spectator',
        content: (
            <><ButtonIcon name="eye" /> Toeschouwer</>
        ),
    },
    {
        value: 'referee',
        content: (
            <><ButtonIcon name="pen" /> Scheidsrechter</>
        ),
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
                <ButtonA
                    color="#3880A8" hoverColor="#307090"
                    href={`mailto:?subject=${encodeURI(subject)}&body=${encodeURI(body)}`}
                >
                    <ButtonIcon name="envelope" />
                    Mail
                </ButtonA>
                <ButtonA 
                    color="#128C7E" hoverColor="#075E54"
                    href={`https://wa.me/?text=${encodeURI(body)}`}
                >
                    <ButtonIcon style="brands" name="whatsapp" size="1.1em" />
                    WhatsApp
                </ButtonA>
            </HSplit>
        </Modal>
    );
}
