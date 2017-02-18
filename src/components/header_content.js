import React, { Component } from 'react';
import HeaderList from './header_list';

class HeaderContent extends Component {
  constructor(props) {
    super(props);
    this.handleAddHeaderClick = this.handleAddHeaderClick.bind(this);
  }

  handleAddHeaderClick(parentHeaderId) {
    this.props.addHeader(parentHeaderId, 'New header!');
  }

  render() {
    let content = '';
    if (this.props.opened) {
      content = (
        <div>
          {this.props.description}

          <HeaderList headers={this.props.subheaders}
                      titleClick={this.props.titleClick}
                      todoClick={this.props.todoClick}
                      addHeader={this.props.addHeader} />
        </div>
      );
    }

    return (
      <div>
        {content}

        <button onClick={() => this.handleAddHeaderClick(this.props.headerId)}>Add header</button>
      </div>
    );
  }
}

export default HeaderContent;
