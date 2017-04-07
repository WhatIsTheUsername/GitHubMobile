/**
 * 欢迎页
 * @flow
 * **/
import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    InteractionManager,
    Platform,
} from 'react-native'
import HomePage from './HomePage'
import ThemeDao from '../expand/dao/ThemeDao'
import SplashScreen from 'react-native-splash-screen'

export default class WelcomePage extends Component {

    //初始化render后只执行一次，这个函数中可以访问任何组件，方法中的子组件在父组件之前执行
    //从这个函数开始，就可以和 JS 其他框架交互了，例如设置计时 setTimeout 或者 setInterval，或者发起网络请求
    componentDidMount() {
        const {navigator} = this.props;
        new ThemeDao().getTheme().then((data=>{
            this.theme=data; //成功获取到主题theme
        }));
        //500m后切换
        this.timer = setTimeout(() => {
            //延迟执行任务，不会影响到正在执行的动画效果
            InteractionManager.runAfterInteractions(() => {
                SplashScreen.hide();    //和工程中的show相对应
                // resetTo 调到一个新的路由，并重置整个路由栈
                navigator.resetTo({   
                    component: HomePage,
                    name: 'HomePage',
                    params:{
                        theme:this.theme
                    }
                });
            });
        }, 500);
    }
    //当组件从界面上移除的时候就会调用这个方法，做一些清理工作，比如清理定时器等等
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }
    render() {
        return (
            <View style={styles.container}>
                {/*<Image style={{flex:1,width:null}} resizeMode='repeat' source={require('../../res/images/LaunchScreen.png')}/>*/}
            </View>
        );
    }

}
const styles = StyleSheet.create({
    container:{
        flex:1,
    }
})