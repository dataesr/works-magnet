import { Button, Checkbox, Link } from "@dataesr/dsfr-plus";
import React from "react";

const LimitedList = ({ list, max }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const limitedList = isExpanded ? list : list.slice(0, max);

  if (list.length <= max) {
    return (
      <ul>
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <ul className="fr-m-0">
        {limitedList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? "Show less" : `Show ${list.length - max} more`}
      </button>
    </>
  );
};

function CheckIcon({ checked }) {
  return checked ? (
    <span className="fr-icon-checkbox-line" aria-hidden="true" />
  ) : (
    <span className="fr-icon-close-circle-line" aria-hidden="true" />
  );
}

function SortButton({ label, searchParams, setSearchParams, sortBy }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button
        className="fr-ml-1v"
        color="beige-gris-galet"
        onClick={() => {
          if (searchParams.get("sort-by") !== sortBy) {
            searchParams.set("sort-order", "asc");
          } else {
            searchParams.set(
              "sort-order",
              searchParams.get("sort-order") === "asc" ? "desc" : "asc"
            );
          }
          searchParams.set("sort-by", sortBy);
          setSearchParams(searchParams);
        }}
        size="sm"
        variant="text"
      >
        {label}
        {searchParams.get("sort-by") === sortBy &&
          searchParams.get("sort-order") === "asc" && <>▲</>}
        {searchParams.get("sort-by") === sortBy &&
          searchParams.get("sort-order") === "desc" && <>▼</>}
      </Button>
    </div>
  );
}

function CorrectionColumn({ mention, mentionsWithCorrection, field }) {
  const correctedMention = mentionsWithCorrection.find(
    (el) => el.id === mention.id
  );

  if (!correctedMention) return null;

  const hasFieldChanged =
    correctedMention.mention_context[field] !==
    correctedMention.mention_context_original[field];

  if (!hasFieldChanged) return null;

  return <CheckIcon checked={correctedMention.mention_context[field]} />;
}

export default function MentionsList({
  mentions,
  mentionsWithCorrection,
  setMentionsWithCorrection,
  searchParams,
  setSearchParams,
  setSelectedMentions,
}) {
  return (
    <table className="mentions-list" style={{ borderSpacing: 0 }}>
      <thead>
        <tr>
          <th />
          <th>
            <SortButton
              label="DOI"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="doi"
            />
          </th>
          <th>Type</th>
          <th>
            <SortButton
              label="Raw form"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="rawForm"
            />
          </th>
          <th>Mention</th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              label="Used"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="mention.mention_context.used"
            />
          </th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              label="Created"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="mention.mention_context.created"
            />
          </th>
          <th
            style={{ writingMode: "vertical-rl", transform: "rotate(210deg)" }}
          >
            <SortButton
              label="Shared"
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              sortBy="mention.mention_context.shared"
            />
          </th>
          <th>Affiliations</th>
          <th>Authors</th>
        </tr>
      </thead>
      <tbody>
        {mentions.map((mention) => (
          <>
            <tr
              className="mention"
              key={mention.id}
              onClick={() => {
                setSelectedMentions(
                  mentions.map((m) =>
                    m.id === mention.id ? { ...m, selected: !m.selected } : m
                  )
                );
              }}
            >
              <td
                onClick={(e) => e.stopPropagation()}
                className={
                  mentionsWithCorrection.find((el) => el.id === mention.id)
                    ? "isCorrected"
                    : ""
                }
              >
                <Checkbox
                  checked={mention.selected}
                  className="fr-ml-1w"
                  onChange={() => {
                    setSelectedMentions(
                      mentions.map((m) =>
                        m.id === mention.id
                          ? { ...m, selected: !m.selected }
                          : m
                      )
                    );
                  }}
                />
              </td>
              <td>
                <Link
                  href={`https://doi.org/${mention.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {mention.doi}
                </Link>
              </td>
              <td className="text-center">{mention.type_original}</td>
              <td className="text-center">{mention.rawForm}</td>
              <td
                style={{ width: "20%" }}
                dangerouslySetInnerHTML={{ __html: mention.context }}
              />
              <td className="text-center">
                <CheckIcon checked={mention.mention_context_original.used} />
              </td>
              <td className="text-center">
                <CheckIcon checked={mention.mention_context_original.created} />
              </td>
              <td className="text-center">
                <CheckIcon checked={mention.mention_context_original.shared} />
              </td>
              <td>
                <LimitedList list={mention.affiliations} max={1} />
              </td>
              <td>
                <LimitedList list={mention.authors} max={2} />
              </td>
            </tr>
            {mentionsWithCorrection.find((el) => el.id === mention.id) && (
              <>
                <tr
                  style={{
                    background: "linear-gradient(to right, #447049,#eee)",
                    color: "#fff",
                  }}
                >
                  <td className="text-center">
                    <span className="fr-icon-edit-line" aria-hidden="true" />
                  </td>
                  <td colSpan={4}>
                    {mentionsWithCorrection.find(
                      (el) =>
                        el.id === mention.id && el.type !== el.type_original
                    ) ? (
                      <span>
                        New type ={" "}
                        {
                          mentionsWithCorrection.find(
                            (el) => el.id === mention.id
                          ).type
                        }
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center">
                    <CorrectionColumn
                      mention={mention}
                      mentionsWithCorrection={mentionsWithCorrection}
                      field="used"
                    />
                  </td>
                  <td className="text-center">
                    <CorrectionColumn
                      mention={mention}
                      mentionsWithCorrection={mentionsWithCorrection}
                      field="created"
                    />
                  </td>
                  <td className="text-center">
                    <CorrectionColumn
                      mention={mention}
                      mentionsWithCorrection={mentionsWithCorrection}
                      field="shared"
                    />
                  </td>
                  <td colSpan={2}>
                    <Button
                      color="blue-cumulus"
                      icon="arrow-go-back-fill"
                      onClick={() => {
                        setMentionsWithCorrection(
                          mentionsWithCorrection.filter(
                            (el) => el.id !== mention.id
                          )
                        );
                      }}
                      size="sm"
                      variant="text"
                    />
                  </td>
                </tr>
                <tr style={{ height: "6px" }}>
                  <td colSpan={9} />
                </tr>
              </>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}
