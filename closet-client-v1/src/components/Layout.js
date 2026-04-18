import {Outlet} from 'react-router-dom';

import React from 'react';

const Layout = () => {
    return (
        <main id="main-content" role="main">
            <Outlet/>
        </main>
    );
}

export default Layout;
