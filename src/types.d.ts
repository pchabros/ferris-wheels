type Variable =
  | "name"
  | "country"
  | "diameter"
  | "status"
  | "seating_capacity"
  | "hourly_capacity";
type DataRaw = {
  [V in Variable]?: string;
};
type Data = {
  [V in Variable]?: V extends
    | "diameter"
    | "seating_capacity"
    | "hourly_capacity"
    ? number
    : string;
};

export { DataRaw, Data };
