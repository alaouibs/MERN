import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";

// import UserPlaces from "./places/pages/UserPlaces";
// import Users from "./user/pages/Users";
// import NewPlace from "./places/pages/NewPlace";
// import UpdatePlaces from "./places/pages/UpdatePlace";
// import Auth from "./user/pages/Auth";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import { useAuth } from "./shared/hooks/auth-hook";
import { AuthContext } from "./shared/context/auth-context";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";

const Users = React.lazy(() => import("./user/pages/Users"))
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"))
const UpdatePlaces = React.lazy(() => import("./places/pages/UpdatePlace"))
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"))
const Auth = React.lazy(() => import("./user/pages/Auth"))

const App = () => {

  const {token, login, logout, userId} = useAuth();
  let routes;

  if (token) {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/places/new" exact>
          <NewPlace />
        </Route>
        <Route path="/places/:placeId" exact>
          <UpdatePlaces />
        </Route>
        <Redirect to="/" />
      </Switch>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:userId/places" exact>
          <UserPlaces />
        </Route>
        <Route path="/auth" exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
      </Switch>
    );
  }
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        logout: logout,
        login: login,
      }}
    >
      <Router>
        <MainNavigation />
        <main><Suspense fallback={<div className="center"><LoadingSpinner/></div>}>{routes}</Suspense></main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
