import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({
    children,
    variant = 'primary',
    className = '',
    to,
    ...props
}) => {
    const baseClass = `btn btn-${variant} ${className}`;

    if (to) {
        return (
            <Link to={to} className={baseClass} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button className={baseClass} {...props}>
            {children}
        </button>
    );
};
