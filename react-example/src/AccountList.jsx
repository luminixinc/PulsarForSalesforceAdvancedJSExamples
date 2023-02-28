import React from 'react';
import { Link } from 'react-router-dom';


export const AccountList = ({ accounts }) => {
    return <ul>{accounts.map(account => <AccountItem key={account.Id} account={account} />)}</ul>
};

const AccountItem = ({ account: { Id, Name } }) => {
    return (
        <li>
            <Link to={`/accounts/${Id}`}>
                {Name}
            </Link>
        </li>
    )
};
