import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';

class HeaderList extends Component {
    constructor(props) {
        super(props);
        this.onAddHeader = this.onAddHeader.bind(this);
        this.state = {};
    }

    onAddHeader(header) {
        this.props.actions.addHeader(header);
    }

    render() {
        const headerList = this.props.headers.map((header, idx) => {
            return <li key={idx}>{header}</li>;
        });

        return (
            <div className="Header">
              <ol>
                {headerList}
              </ol>
              <button onClick={() => this.onAddHeader('Test header')}>Add header</button>
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        headers: state.org.headers
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(orgActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderList);
