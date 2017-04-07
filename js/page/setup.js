
import React,{Component} from 'react'
import {
    Navigator,
}from 'react-native'

import RepositoryUtils from '../expand/dao/RepositoryUtils'
import WelcomePage from './WelcomePage'


function setup(){

    //获取数据
    RepositoryUtils.init(true);

    class Root extends Component {

        constructor(props) {
            super(props);
            this.state = {
            };
        }
        _renderScene(route, navigator) {
            let Component = route.component;
            return (
                <Component {...route.params} navigator={navigator}/>
            );
        }

        _configureScene(route, routeStack){
            return Navigator.SceneConfigs.FloatFromLeft;
        }

        render() {
            return (
                <Navigator
                    //初始化路由
                    initialRoute={{
                        name: 'WelcomePage',
                        component:WelcomePage
                    }}
                    //动画场景
                    configureScene = {this._configureScene}
                    //渲染场景
                    renderScene={(e, i)=>this._renderScene(e, i)}
                />
            );
        }
    }

    return <Root/>;
}

module.exports = setup;