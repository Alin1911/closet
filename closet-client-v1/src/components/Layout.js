import {Outlet} from 'react-router-dom';

import React from 'react';

const Layout = () => {
    return (
        <main id="main-content" role="main" tabIndex={-1}>
            <Outlet/>
        </main>
    );
}

export default Layout;
