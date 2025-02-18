import { Action, ActionPanel, Form, Icon, LocalStorage, showToast, Toast, useNavigation } from "@raycast/api";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CountdownDate } from "./types/types";
import { LocalStorageKey } from "./utils/constants";
import Style = Toast.Style;
import { isEmpty } from "./utils/common-utils";
import { ActionOpenPreferences } from "./components/action-open-preferences";

export default function AddCountdownDate(props: {
  countdownDates: CountdownDate[];
  setRefresh: Dispatch<SetStateAction<number>>;
}) {
  const { countdownDates, setRefresh } = props;
  const [date, setDate] = useState<Date>();
  const [icon, setIcon] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const { pop } = useNavigation();

  useEffect(() => {
    async function _fetchLifeProgress() {
      if (typeof date !== "undefined") {
        const now = new Date();
        if (now < date) {
          const days =
            (new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24);
          setPreview(`${icon} ${Math.floor(days)} days left until ${title}`);
        } else {
          const days =
            (now.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).getTime()) /
            (1000 * 60 * 60 * 24);
          setPreview(`${icon} ${Math.floor(days)} days passed since ${title}`);
        }
      }
    }

    _fetchLifeProgress().then();
  }, [date, icon, title, description]);

  return (
    <Form
      navigationTitle={"Add Countdown Date"}
      actions={
        <ActionPanel>
          <Action
            title={"Add Countdown Date"}
            icon={Icon.Clock}
            onAction={async () => {
              if (isEmpty(title)) {
                await showToast(Style.Failure, "Title cannot be empty!");
                return;
              }

              if (typeof date !== "undefined") {
                const _cdDate = [...countdownDates];
                const now = new Date();
                _cdDate.push({
                  id: "CountdownDate_" + now.getTime(),
                  creatAt: now.getTime(),
                  modifyAt: now.getTime(),
                  title: title,
                  description: description,
                  date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).getTime(),
                  icon: isEmpty(icon) ? (Date.now() > date.getTime() ? "⌛️" : "⏳") : icon,
                });

                const lastDate = _cdDate.filter((value) => {
                  return value.date < now.getTime();
                });
                const futureDate = _cdDate.filter((value) => {
                  return value.date >= now.getTime();
                });
                lastDate.sort((a, b) => {
                  return b.date - a.date;
                });
                futureDate.sort((a, b) => {
                  return a.date - b.date;
                });
                await LocalStorage.setItem(
                  LocalStorageKey.COUNTDOWN_DATE_KEY,
                  JSON.stringify([...futureDate, ...lastDate])
                );
                setRefresh(now.getTime());
                pop();
                await showToast(Style.Success, "Date successfully added.");
              } else {
                await showToast(Style.Failure, "Date cannot be empty!");
              }
            }}
          />
          <ActionOpenPreferences />
        </ActionPanel>
      }
    >
      <Form.DatePicker id={"Date"} title={"Date"} value={date} onChange={setDate} />
      <Form.TextField
        id={"Title"}
        title={"Title"}
        placeholder={"Countdown date title"}
        value={title}
        onChange={setTitle}
      />
      <Form.TextField
        id={"Icon"}
        title={"Icon"}
        placeholder={"Type : to enter emoji"}
        value={icon}
        onChange={setIcon}
      />
      <Form.TextField
        id={"Description"}
        title={"Description"}
        placeholder={"Countdown date description (optional)"}
        value={description}
        onChange={setDescription}
      />
      <Form.Description title={"Preview"} text={preview} />
    </Form>
  );
}
