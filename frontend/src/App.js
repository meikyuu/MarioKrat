import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import Loadable from 'react-loadable';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';
import theme from './theme';
import Loader from './component/Loader';
import Logo from './image/Logo.svg';

function route(path) {
    return Loadable({
        loader() {
            return import(`./route/${path}`);
        },
        loading: Loader,
        delay: 300,
    });
}

const Home = route('Home');
const Tournament = route('Tournament');
const JipBingo = route('JipBingo');

const Container = styled.div`
    height: 100%;
    background-color: ${theme.bgColor};
    color: ${theme.textColor};
`;

const Wrapper = styled.div`
    padding: 1rem;
`;

const Title = styled.h1`
    > img {
        height: 1em;
        position: relative;
        top: 0.125em;
        margin-right: 0.25em;
    }
`;

function App() {
    return (
        <Container>
            <Scrollbars>
                <Wrapper>
                    <BrowserRouter>
                        <Title><img src={Logo} alt="logo" />Mario Krat</Title>
                        <Switch>
                            <Route exact path="/" render={(props) => <Home {...props} />} />
                            <Route path="/t/:token?" render={(props) => <Tournament {...props} />} />
                            <Route path="/jip-bingo" render={(props) => <JipBingo {...props} />} />
                        </Switch>
                    </BrowserRouter>
                </Wrapper>
            </Scrollbars>
        </Container>
    );
}

export default App;
