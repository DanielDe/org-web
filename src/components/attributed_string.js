import React, { Component } from 'react';

class AttributedString extends Component {
  render() {
    const parts = this.props.parts.map(part => {
      if (part.type === 'text') {
        return part.contents;
      } else if (part.type === 'link') {
        const uri = part.contents.uri;
        const title = part.contents.title || uri;

        return <a key={Math.random()} href={uri}>{title}</a>;
      } else {
        console.error(`Unrecognized description part type: ${part.type}`);
        return '';
      }
    });

    return <span>{parts}</span>;
  }
}

export default AttributedString;
