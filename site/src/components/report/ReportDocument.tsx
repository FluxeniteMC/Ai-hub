import type { InlineNode, ReportBlock } from '../../types/catalog';

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        const key = `${node.t}-${index}`;
        switch (node.t) {
          case 'b':
            return <strong key={key}>{node.v}</strong>;
          case 'i':
            return <em key={key}>{node.v}</em>;
          case 'code':
            return (
              <code key={key} className="report__code">
                {node.v}
              </code>
            );
          case 'a':
            return (
              <a key={key} href={node.href} target="_blank" rel="noopener noreferrer">
                {node.v}
              </a>
            );
          default:
            return <span key={key}>{node.v}</span>;
        }
      })}
    </>
  );
}

/**
 * Renders the build-time Markdown block tree.
 *
 * Content is rendered as React elements rather than injected HTML, so text
 * from the report can never execute. Only http(s) links survive the parser.
 */
export function ReportDocument({ blocks }: { blocks: ReportBlock[] }) {
  return (
    <div className="report">
      {blocks.map((block, index) => {
        const key = index;

        switch (block.type) {
          case 'heading': {
            const Tag = `h${Math.min(block.level, 4)}` as 'h2' | 'h3' | 'h4';
            return (
              <Tag key={key} className={`report__h report__h${block.level}`}>
                <Inline nodes={block.children} />
              </Tag>
            );
          }

          case 'paragraph':
            return (
              <p key={key} className="report__p">
                <Inline nodes={block.children} />
              </p>
            );

          case 'list':
            return block.ordered ? (
              <ol key={key} className="report__list">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Inline nodes={item} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={key} className="report__list">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Inline nodes={item} />
                  </li>
                ))}
              </ul>
            );

          case 'table':
            return (
              <div key={key} className="table-scroll report__table-wrap">
                <table className="data-table report__table">
                  <thead>
                    <tr>
                      {block.header.map((cell, cellIndex) => (
                        <th key={cellIndex} scope="col">
                          <Inline nodes={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>
                            <Inline nodes={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'code':
            return (
              <pre key={key} className="report__pre">
                <code>{block.value}</code>
              </pre>
            );

          case 'hr':
            return <hr key={key} className="report__hr" />;

          default:
            return null;
        }
      })}
    </div>
  );
}