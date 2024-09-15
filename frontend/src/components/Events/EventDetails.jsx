import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteEvent,
  fetchEvent,
  getImgUrl,
  queryClient,
} from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", { id }],
    queryFn: (args) => fetchEvent({ id, ...args }),
  });

  const {
    mutate,
    isPending,
    isError: isErrorDeletion,
    error: errorDelete,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // Navigate to the events page after deleting the event
      navigate("/events");
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
    },
  });

  const handleDeleteEvent = () => mutate({ id });

  const handleStartDelete = () => setIsDeleting(true);

  const handleCancelDelete = () => setIsDeleting(false);

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleCancelDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            {isPending && <p>Deleting, please wait...</p>}
            {!isPending && (
              <>
                <button onClick={handleCancelDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDeleteEvent} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock
              title="Failed to delete event"
              message={errorDelete?.info?.message || "Failed to delete event"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isLoading && <LoadingIndicator />}
      {isError && (
        <ErrorBlock
          title="An error occurred"
          message={error?.info?.message || "Failed to fetch event details"}
        />
      )}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data?.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img
              src={getImgUrl(data?.image)}
              alt={data?.image?.split("."[0])}
            />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data?.location}</p>
                <time
                  dateTime={`Todo-DateT$Todo-Time`}
                >{`${data?.date} @ ${data?.time}`}</time>
              </div>
              <p id="event-details-description">{data?.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
