import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const alertRulesCollection = collection(db, "alertRules");

export function createAlertRule({ coin, threshold, direction }) {
  return addDoc(alertRulesCollection, {
    coin,
    threshold,
    direction,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export function deleteAlertRuleById(ruleId) {
  return deleteDoc(doc(db, "alertRules", ruleId));
}

export function updateAlertRuleById(ruleId, updates) {
  return updateDoc(doc(db, "alertRules", ruleId), {
    ...updates,
    status: "pending",
  });
}
