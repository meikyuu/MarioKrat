import React from 'react';
import styled from 'styled-components';

const sets = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    duotone: 'fad',
    brands: 'fab',
};

const StyledIcon = styled(({ color, ...props }) => <i {...props} />)`
    ${({ color }) => color ? `
        color: ${color};
    ` : ``}
`;

export default function Icon({
    name,
    className,
    set = 'solid',
    ...props
}) {
    const classNames = [sets[set], `fa-${name}`];

    if (className) {
        classNames.push(className);
    }

    return <StyledIcon className={classNames.join(' ')} {...props} />;
}
