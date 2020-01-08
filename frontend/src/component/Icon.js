import React from 'react';
import styled from 'styled-components';

const styles = {
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
    style = 'solid',
    ...props
}) {
    const classNames = [styles[style], `fa-${name}`];

    if (className) {
        classNames.push(className);
    }

    return <StyledIcon className={classNames.join(' ')} {...props} />;
}
