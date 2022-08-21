import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { Combobox } from "@udecode/plate-ui-combobox";
import {
  comboboxStore,
  getPluginOptions,
  usePlateEditorRef,
  useEventEditorId,
  useActiveComboboxStore,
  getPluginsByKey,
} from "@udecode/plate";
import {
  ELEMENT_MENTION,
  getMentionOnSelectItem,
} from "@udecode/plate-mention";

export const AsyncCombobox = ({
  items,
  component,
  onRenderItem,
  pluginKey = ELEMENT_MENTION,
  id = pluginKey,
}) => {
  //introduce states for managing API calls
  const [isFetchingData, setFetchingData] = React.useState(false);
  const [localStateItems, setItems] = React.useState(items);
  const loadingItem = [{ key: 0, text: "Loading Items" }];

  const arrayFlip = (fetchedData) => {
    let comboBoxItems = fetchedData.map((item) => {
      return {
        key: item.id,
        text: item.login,
        data: {
          url: item.html_url,
          type: item.type,
        },
      };
    });

    return comboBoxItems;
  };

  //editor and get trigger based on editor
  const editor = usePlateEditorRef();
  const { trigger } = getPluginOptions(editor, pluginKey);

  //focused editorId and id of open combobox
  const focusedEditorId = useEventEditorId("focus");
  const activeId = comboboxStore.use.activeId();

  //store value identifying if combobox is open
  const open = comboboxStore.use.isOpen();
  const text = comboboxStore.use.text();
  const search = useRef();

  const isOpen = useMemo(() => {
    if (!open || focusedEditorId !== editor.id || activeId !== id) {
      return null;
    }
    return true;
  }, [open, editor.id, focusedEditorId, activeId, id]);

  useEffect(() => {
    if (text === null) {
      search.current = text;
      return;
    }

    if (isOpen && text !== search.current) {
      console.log(text);
      search.current = text;
    }
  }, [isOpen, text, search]);

  useEffect(() => {
    if (isOpen) {
      console.log("It's open do async function");
      setFetchingData(true);
      fetch("https://api.github.com/users")
        .then((res) => res.json())
        .then((data) => {
          let arr = arrayFlip(data);
          setItems(arr);
          setFetchingData(false);
        })
        .catch((err) => console.error(err));
    } else {
      console.log("it's closed");
    }
  }, [isOpen]);

  {
    return (
      <Combobox
        id={id}
        controlled
        trigger={trigger}
        items={isFetchingData ? loadingItem : localStateItems}
        onRenderItem={onRenderItem}
        component={component}
        onSelectItem={getMentionOnSelectItem({ key: pluginKey })}
      />
    );
  }
};
