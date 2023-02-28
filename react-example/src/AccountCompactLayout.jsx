import React from 'react';


export const AccountCompactLayout = ({ account, compactLayoutDetails: [ firstField, ...otherFields ] }) => {
    const firstValue = account[firstField];
    const otherValues = otherFields.map(field => account[field]).filter(el => el !== "").join(" • ");

    return (
        <div>
            <h1 className={'account-title'}>{firstValue}</h1>
            <h3>Account</h3>
            <p>{otherValues}</p>
        </div>
    )
};
