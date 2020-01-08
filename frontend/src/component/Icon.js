import React from 'react';

const styles = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    duotone: 'fad',
    brands: 'fab',
};

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

    return <i className={classNames.join(' ')} {...props} />;
}
