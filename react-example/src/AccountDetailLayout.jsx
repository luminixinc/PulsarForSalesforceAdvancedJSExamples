import React from 'react';


export const AccountDetailLayout = ({ account, layoutDetails: { detailLayoutSections } }) => {
    return (
        <div>
            <h1>Account Details</h1>
            {detailLayoutSections.map(({ heading, layoutRows, layoutSectionId }) =>
                <LayoutSection key={layoutSectionId} heading={heading} layoutRows={layoutRows} account={account} />
            )}
        </div>
    )
};

const LayoutSection = ({ heading, layoutRows, account }) => {
    return (
        <div>
            <h3>{heading}</h3>
            {layoutRows.map(({ layoutItems }) => {
                return layoutItems.map(({ label, layoutComponents }, index) => {
                    return <LayoutRow key={index} account={account} label={label} layoutComponents={layoutComponents} />
                })
            })}
        </div>
    )
};

const LayoutRow = ({ account, label, layoutComponents }) => {
    if (!label.length || !layoutComponents.length) return null;

    const fieldApiName = layoutComponents[0].value;
    const accountValue = account[fieldApiName];

    return (
        <div>
            <p className={'field-label'}>{label}</p>
            <p className={'field-value'}>{accountValue || <span>&nbsp;</span>}</p>
            <hr className={'gray'}/>
        </div>
    )
};
