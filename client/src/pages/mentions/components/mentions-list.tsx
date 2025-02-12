import { Col, Row } from "@dataesr/dsfr-plus";
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
      <ul>
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

export default function MentionsList({ mentions }) {
  return (
    <ol>
      {mentions.map((mention) => (
        <li key={mention.id}>
          <Row>
            <Col md={2}>{mention.doi}</Col>
            <Col md={1}>{mention.rawForm}</Col>
            <Col md={4}>{mention.context}</Col>
            <Col md={3}>
              <LimitedList list={mention.affiliations} max={3} />
            </Col>
            <Col md={2}>
              <LimitedList list={mention.authors} max={5} />
            </Col>
          </Row>
        </li>
      ))}
    </ol>
  );
}
