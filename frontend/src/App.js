import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';
import theme from './theme';
import Loader from './component/Loader';

function Loading() {
    return 'Loading...';
}

function screen(path) {
    return Loadable({
        loader() {
            return import(`./screen/${path}`);
        },
        loading: Loader,
        delay: 300,
    });
}

const Home = screen('Home');
const Tournament = screen('Tournament');

const Container = styled.div`
    height: 100%;
    background-color: ${theme.bgColor};
    color: ${theme.textColor};
`;

const Wrapper = styled.div`
    padding: 1rem;
`;

function App() {
    return (
        <Container>
            <Scrollbars>
                <Wrapper>
                    <BrowserRouter>
                        <Switch>
                            <Route exact path="/" render={(props) => <Home {...props} />} />
                            <Route path="/t/:token?" render={(props) => <Tournament {...props} />} />
                        </Switch>
                    </BrowserRouter>
                </Wrapper>
            </Scrollbars>
        </Container>
    );
}

export default App;
