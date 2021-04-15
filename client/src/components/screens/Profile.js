import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";

const Profile = () => {
  const [mypics, setPics] = useState([]);
  const [image, setImage] = useState("");
  const { state, dispatch } = useContext(UserContext);
  useEffect(() => {
    fetch("/mypost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setPics(result.mypost);
      });
  }, []);

  useEffect(() => {
    if (image) {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "instagram-clone");
      data.append("cloud_name", "asdf1254");
      fetch("https://api.cloudinary.com/v1_1/asdf1254/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          fetch("/updatepic",{
            method:"put",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer "+ localStorage.getItem("jwt")
            },
            body: JSON.stringify({
              pic: data.url
            })

          }).then(res => res.json())
          .then(result => {
            console.log(result)
            localStorage.setItem("user", JSON.stringify({...state, pic:result.pic}))
            dispatch({type: "UPDATEPIC", payload: result.pic})
            window.location.reload()
          })
          
        })
        .catch((err) => console.log(err));
    }
  }, [image]);

  const updatePhoto = (file) => {
    setImage(file);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto" }}>
      <div
        style={{
          margin: "18px 0px",
          borderBottom: "1px solid grey",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <div>
            <img
              style={{ width: "160px", height: "160px", borderRadius: "50%" }}
              src={state ? state.pic : "Loading"} alt="profile_pic"
            />
          </div>
          <div>
            <h5>{state ? state.name : "Loading"}</h5>
            <h6>{state ? state.email : "Loading"}</h6>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "108%",
              }}
            >
              <h6>{mypics.length} posts</h6>
              <h6>{state ? state.followers.length : "loading"} follower</h6>
              <h6>{state ? state.following.length : "loading"} following</h6>
            </div>
          </div>
        </div>
        <div className="file-field input-field">
          <div className="btn blue darken-1">
            <span>Update pic</span>
            <input
              type="file"
              onChange={(e) => {
                updatePhoto(e.target.files[0]);
              }}
            />
          </div>
          <div className="file-path-wrapper">
            <input className="file-path validate" type="text" />
          </div>
        </div>
      </div>

      <div className="gallery">
        {mypics.map((item) => {
          return (
            <img
              className="item"
              src={item.photo}
              alt={item.title}
              key={item._id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
