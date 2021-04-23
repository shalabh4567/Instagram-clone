import React, { useContext, useRef, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { UserContext } from "../App";
import M from "materialize-css";

const NavBar = () => {
  const { state, dispatch } = useContext(UserContext);
  const history = useHistory();
  const searchModal = useRef(null);
  const [search, setSearch] = useState("");
  const [userDetails, setUserDetails] = useState([]);

  useEffect(() => {
    M.Modal.init(searchModal.current);
  }, []);

  const deleteAccount = () => {
    //console.log(state._id);
    fetch("/deleteaccount", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deleteId: state._id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        history.push("/signin");
        localStorage.clear();
        dispatch({ type: "CLEAR" });
        M.toast({
          html: data.message,
          classes: "#388e3c green darken-2",
        });
      });
  };

  const renderList = () => {
    if (state) {
      //console.log(state)
      return [
        <li key="1">
          <i
            className="material-icons modal-trigger"
            data-target="modal1"
            style={{ color: "black" }}
          >
            search
          </i>
        </li>,
        <li key="2">
          <Link to="/profile">Profile</Link>
        </li>,
        <li key="3">
          <Link to="/myfollowingpost">My following posts</Link>
        </li>,
        <li key="4">
          <Link to="/create">Create Post</Link>
        </li>,
        <li key="5">
          <button
            className="btn #c62828 red darken-3"
            onClick={() => {
              localStorage.clear();
              dispatch({ type: "CLEAR" });
              history.push("/signin");
            }}
          >
            Log out
          </button>
        </li>,
        <li key="6">
          <button
            className="btn #c62828 red darken-3"
            onClick={() => deleteAccount()}
          >
            Delete Acc
          </button>
        </li>,
      ];
    } else {
      return [
        <li key="1">
          <Link to="/signin">Login</Link>
        </li>,
        <li key="2">
          <Link to="/signup">Signup</Link>
        </li>,
      ];
    }
  };

  const fetchUsers = (query) => {
    setSearch(query);
    fetch("/search-users", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    })
      .then((res) => res.json())
      .then((results) => {
        setUserDetails(results.user);
      });
  };
  return (
    <div>
      <nav>
        <div className="nav-wrapper white">
          <Link to={state ? "/" : "/signin"} className="brand-logo left">
            Instagram
          </Link>
          <ul id="nav-mobile" className="right">
            {renderList()}
          </ul>
        </div>
        <div
          id="modal1"
          className="modal"
          ref={searchModal}
          style={{ color: "black" }}
        >
          <div className="modal-content">
            <input
              type="text"
              placeholder="search user"
              value={search}
              onChange={(e) => fetchUsers(e.target.value)}
            />
            <ul className="collection">
              {userDetails.map((item) => {
                return (
                  <Link
                    to={
                      item._id !== state._id
                        ? "/profile/" + item._id
                        : "/profile"
                    }
                    onClick={() => {
                      M.Modal.getInstance(searchModal.current).close();
                      setSearch("");
                    }}
                  >
                    <li className="collection-item">{item.email}</li>
                  </Link>
                );
              })}
            </ul>
          </div>
          <div className="modal-footer">
            <button
              className="modal-close waves-effect waves-green btn-flat"
              onClick={() => setSearch("")}
            >
              close
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
