export type StaffGroup = "entertainers" | "develops" | "board";

export const STAFF_GROUP_OPTIONS: { value: StaffGroup; label: string }[] = [
  { value: "entertainers", label: "COMET ENTERTAINERS" },
  { value: "develops", label: "COMET DEVELOPS" },
  { value: "board", label: "COMET 이사회" },
];

const STAFF_GROUP_VALUES = new Set<StaffGroup>(STAFF_GROUP_OPTIONS.map((group) => group.value));

export function normalizeStaffGroup(value: FormDataEntryValue | string | null | undefined): StaffGroup | undefined {
  const group = String(value || "").trim();
  return STAFF_GROUP_VALUES.has(group as StaffGroup) ? (group as StaffGroup) : undefined;
}

export function getStaffGroupLabel(group?: StaffGroup | null) {
  return STAFF_GROUP_OPTIONS.find((item) => item.value === group)?.label || "미지정";
}

export function getStaffGroupAreaHref(group?: StaffGroup | null) {
  return group ? `/staff/${group}` : "/staff";
}
