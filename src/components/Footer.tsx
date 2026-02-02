import { Parser as HtmlToReactParser } from "html-to-react";

const Footer = () => {
  const content = '<div align="right"><br/>PLACEHOLDER_FOOTER_CONTENT</div>';
  const htmlToReactParser = HtmlToReactParser();
  const parsedContent = htmlToReactParser.parse(content);

  return (
    <div
      style={{
        marginTop: "auto",
        width: "100%",
      }}
    >
      {parsedContent}
    </div>
  );
};

export default Footer;
