import { TextField } from "@mui/material";

export default function SearchBar(ps: { setSearch: (s: string) => void, initial?: string, label?: string }) {
    return <TextField label={ps.label ?? "Search"}
                      focused={false}
                      defaultValue={ps.initial}
                      sx={{ mt: 1, mb: 2, width: "100%" }}
                      onKeyDown={(event) => {
                          if (event.key === "Enter") {
                              ps.setSearch((event.target as any).value);
                          }
                      }}
           />;
}
