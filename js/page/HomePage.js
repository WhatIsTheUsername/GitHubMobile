/**
 * 首页
 * @flow
 */

import React, {Component} from 'react';

import {
    StyleSheet,
    Image,
    View,
} from 'react-native'

//导入组件TabNavigator
import TabNavigator from 'react-native-tab-navigator'
//最热
import PopularPage from './PopularPage'
//趋势
import TrendingPage from './TrendingPage'
//最爱
import FavoritePage from './FavoritePage'
//我的
import MyPage from './my/MyPage'

import ArrayUtils from '../util/ArrayUtils'

//tab flag
export var FLAG_TAB = {
    flag_popularTab: 'flag_popularTab', flag_trendingTab: 'flag_trendingTab',
    flag_favoriteTab: 'flag_favoriteTab', flag_myTab: 'flag_myTab'
}

export default class HomePage extends Component {
    //构造函数
    constructor(props) {
        super(props);
        this.subscribers = [];
        this.changedValues = {
            favorite: {
                popularChange: false,  //popular收藏是否有变化
                 trendingChange: false //trending收藏是否有变化
                },
            
            my: {
                languageChange: false,  //trending页面的内容标签是否变化
                 keyChange: false,      //popular页面的内容标签是否变化
                  themeChange: false    //应用主题风格是否变化
                }
        };
        let selectedTab = this.props.selectedTab ? this.props.selectedTab : FLAG_TAB.flag_popularTab; //默认选中popular页面
        this.state = {   //状态机
            selectedTab: selectedTab,
            theme: this.props.theme
        };
    }

    //添加subscriber到this.subscribers中
    addSubscriber(subscriber) {
        ArrayUtils.add(this.subscribers, subscriber);
    }

    //移除subscriber
    removeSubscriber(subscriber) {
        ArrayUtils.remove(this.subscribers, subscriber);
    }

    //TabbarItem点击事件
    onSelected(object) {
        // if (this.updateFavorite && 'popularTab' === object)this.updateFavorite(object);

        if (object !== this.state.selectedTab) {
            this.subscribers.forEach((item, index, arr)=> {
                if (typeof(item) == 'function')item(this.state.selectedTab, object);
            })
        }

        //重置下Change
        if(object===FLAG_TAB.flag_popularTab)this.changedValues.favorite.popularChange=false;
        if(object===FLAG_TAB.flag_trendingTab)this.changedValues.favorite.trendingChange=false;

        this.setState({
            selectedTab: object,
        })

    }

    //重新加载下
    onReStart(jumpToTab){
        this.props.navigator.resetTo({
            component: HomePage,
            name: 'HomePage',
            params: {
                ...this.props,
                theme:this.state.theme,
                selectedTab: jumpToTab,
            }
        });
    }

    //主题风格变化时回调
    onThemeChange(theme) {
        if (!theme)return;
        this.setState({
            theme: theme
        })
        this.changedValues.my.themeChange = true;
        this.subscribers.forEach((item, index, arr)=> {
            if (typeof(item) == 'function')item(theme);
        })
        //重置下Change
        this.changedValues.my.themeChange = false;
    }

    _renderTab(Component, selectedTab, title, renderIcon) {
        return (
            <TabNavigator.Item
                selected={this.state.selectedTab === selectedTab}  //是否选中
                title={title}
                selectedTitleStyle={this.state.theme.styles.selectedTitleStyle}
                renderIcon={() => <Image style={styles.tabBarIcon}
                                         source={renderIcon}/>}
                renderSelectedIcon={() => <Image
                    style={[styles.tabBarSelectedIcon, this.state.theme.styles.tabBarSelectedIcon]}
                    source={renderIcon}/>}
                onPress={() => this.onSelected(selectedTab)}>  
                <Component {...this.props} theme={this.state.theme} homeComponent={this}/>
            </TabNavigator.Item>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <TabNavigator
                    tabBarStyle={{opacity: 0.9,}}
                    sceneStyle={{paddingBottom: 0}}
                >
                    {this._renderTab(PopularPage, FLAG_TAB.flag_popularTab, 'Popular', require('../../res/images/ic_polular.png'))}
                    {this._renderTab(TrendingPage, FLAG_TAB.flag_trendingTab, 'Trending', require('../../res/images/ic_trending.png'))}
                    {this._renderTab(FavoritePage, FLAG_TAB.flag_favoriteTab, 'Favorite', require('../../res/images/ic_favorite.png'))}
                    {this._renderTab(MyPage, FLAG_TAB.flag_myTab, 'My', require('../../res/images/ic_my.png'))}
                </TabNavigator>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        // backgroundColor:'#fff',
    },
    //tabbar未选中图标样式
    tabBarIcon: {   
        width: 26, height: 26,
        resizeMode: 'contain',
    },
    //tabbar选中图标样式
    tabBarSelectedIcon: {
        width: 26, height: 26,
        resizeMode: 'contain',
        // tintColor:'#4caf50'
    }
})
