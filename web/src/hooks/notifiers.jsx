import { useContext } from "react";
import { NotifierContext } from "../contexts/notifiers";

export const useNotifiers = () => {
  return useContext(NotifierContext);
};
