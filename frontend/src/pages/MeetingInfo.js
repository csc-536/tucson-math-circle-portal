import React, { useEffect, useState } from "react";
import { Button, makeStyles } from "@material-ui/core";
import MeetingFields from "../components/MeetingFields";
import RegisteredStudentTable from "../components/RegisteredStudentTable";
import SaveIcon from "@material-ui/icons/Save";
import EventIcon from "@material-ui/icons/Event";
import { cloneDeep, some } from "lodash";
import DeleteButton from "../components/DeleteButton";
import { useHistory, useLocation } from "react-router";
import {
  attendMeeting,
  deleteMeeting,
  registerMeeting,
  sendReminderEmail,
  updateMeeting,
} from "../http";
import ReminderButton from "../components/ReminderButton";

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: "wrap",
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
    float: "right",
  },
}));

const MeetingInfo = () => {
  const classes = useStyles();
  const location = useLocation();
  const [disabled, setDisabled] = useState(false);
  const history = useHistory();
  const [form, setForm] = useState({
    date: new Date(),
    time: "",
    duration: "",
    topic: "",
    sessionLevel: "",
    materials_object_name: "",
    materials_uploaded: false,
    zoomLink: "",
    zoomPassword: "",
    miroLink: "",
    student_notes: "",
    coordinator_notes: "",
    students: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const {
      state: {
        meeting: {
          date,
          sessionLevel,
          zoom_link,
          miro_link,
          zoomPassword,
          topic,
          duration,
          students,
          uuid,
          materials_object_name,
          materials_uploaded,
          student_notes,
          coordinator_notes,
        },
        past,
      },
    } = location;
    setForm({
      ...form,
      ...{
        date,
        time: getTime(date),
        topic,
        sessionLevel,
        zoomLink: zoom_link,
        miroLink: miro_link,
        materials_object_name,
        materials_uploaded,
        zoomPassword,
        duration,
        uuid,
        students,
        student_notes,
        coordinator_notes,
      },
    });
    setDisabled(past);
  }, [location]);

  const handleCheckAttended = async (e, i) => {
    const students = cloneDeep(form["students"]);
    const attended = e.target.checked;
    const { student_id } = students[i];
    try {
      await attendMeeting({
        meeting_id: form["uuid"],
        student_id,
        attended,
      });
      students[i].attended = attended;
      setForm({
        ...form,
        ...{ students },
      });
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    const {
      students,
      date: date_and_time,
      miroLink: miro_link,
      sessionLevel: session_level,
      materials_object_name,
      materials_uploaded,
      student_notes,
      coordinator_notes,
      zoomLink: zoom_link,
      duration,
      topic,
      uuid: meeting_id,
    } = form;

    const err = {};
    // TODO: Validate inputs
    if (duration === "") {
      err["duration"] = "Duration is required!";
    }
    if (topic === "") {
      err["topic"] = "Topic is required!";
    }
    if (session_level === "") {
      err["sessionLevel"] = "Session level is required!";
    }
    if (zoom_link === "") {
      err["zoomLink"] = "Zoom link is required!";
    }
    if (miro_link === "") {
      err["miroLink"] = "Miro link is required!";
    }

    if (Object.keys(err).length !== 0) {
      setErrors(err);
      return;
    }

    try {
      await updateMeeting({
        date_and_time,
        duration,
        zoom_link,
        session_level,
        topic,
        miro_link,
        materials_object_name,
        materials_uploaded,
        meeting_id,
        student_notes,
        coordinator_notes,
      });
      history.push("/meetings");
    } catch (error) {
      console.log(error.response);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMeeting(form["uuid"]);
      history.push("/meetings");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendReminder = async () => {
    try {
      const res = await sendReminderEmail(form["uuid"]);
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <div>
      <form
        className={classes.root}
        noValidate
        autoComplete="off"
        id="new-meeting-form"
        onSubmit={handleSaveMeeting}
      >
        <MeetingFields
          form={form}
          errors={errors}
          setForm={setForm}
          disabled={disabled}
        />
        {disabled ? (
          ""
        ) : (
          <div style={{ marginBottom: "60px" }}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<SaveIcon />}
              type="submit"
              disableElevation
            >
              Save
            </Button>
            <DeleteButton
              deleteAction={handleDelete}
              className={classes.button}
            />
            <ReminderButton
              onClick={handleSendReminder}
              className={classes.button}
            />
          </div>
        )}

        <RegisteredStudentTable
          students={form["students"]}
          handleCheckAttended={handleCheckAttended}
        />
      </form>
    </div>
  );
};

function getTime(d) {
  const date = new Date(d);
  const h = toTwoDigits(date.getHours());
  const m = toTwoDigits(date.getMinutes());
  return `${h}:${m}`;
}

function toTwoDigits(s) {
  return s < 10 ? `0${s}` : `${s}`;
}

export default MeetingInfo;
