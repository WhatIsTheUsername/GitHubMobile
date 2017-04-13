/**
 *
 *
 * @flow
 */
'use strict';

import React, {Component} from 'react'
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableNativeFeedback,
    View,
    Alert,
} from 'react-native'
import GlobalStyles from '../../res/styles/GlobalStyles'
import HTMLView from 'react-native-htmlview'
import WebViewPage from '../page/WebViewPage'

export default class TrendingRepoCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFavorite: this.props.projectModel.isFavorite,  //是否收藏
            favoriteIcon: this.props.projectModel.isFavorite ? require('../../res/images/ic_star.png') : require('../../res/images/ic_unstar_transparent.png'),
        };
    }

    //当props发生变化时执行，初始化render时不执行，在这个回调函数里面，你可以根据属性的变化，通过调用this.setState()来更新你的组件状态，旧的属性还是可以通过this.props来获取,这里调用更新状态是安全的，并不会触发额外的render调用
    componentWillReceiveProps(nextProps) {//当从当前页面切换走，再切换回来后
        this.setFavoriteState(nextProps.projectModel.isFavorite)
    }

    //更新对应model和组件
    setFavoriteState(isFavorite) {
        this.props.projectModel.isFavorite = isFavorite;  //更新model
        this.setState({      //更行ui
            isFavorite: isFavorite,
            favoriteIcon: isFavorite ? require('../../res/images/ic_star.png') : require('../../res/images/ic_unstar_transparent.png')
        })
    }

    //收藏点击事件
    onPressFavorite() {
        this.setFavoriteState(!this.state.isFavorite)
        this.props.onFavorite(this.props.projectModel.item, !this.state.isFavorite)  //更新其他组件
    }

    render() {
        var item = this.props.projectModel.item;  //传入的model
        var TouchableElement = TouchableHighlight;
        var description='<p>'+item.description+'</p>';
        return (
            <TouchableElement
                onPress={this.props.onSelect}  //点击事件
                onShowUnderlay={this.props.onHighlight}
                underlayColor='transparent'
                onHideUnderlay={this.props.onUnhighlight}>

                {/*name*/}
                <View style={GlobalStyles.cell_container}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.title}>
                            {item.fullName}
                        </Text>

                    </View>
                    {/*<Text style={styles.description}>*/}
                        {/*{item.description}*/}
                    {/*</Text>*/}

                    {/*html*/}
                    <HTMLView
                        value={description}
                        onLinkPress={(url) => {
                            this.props.navigator.push({
                                component: WebViewPage,
                                params: {
                                    title:url,
                                    url:url,
                                    ...this.props
                                },
                            });
                        }}
                        stylesheet={{
                            p:styles.description,
                            a:styles.description,
                        }}
                    />

                    {/*star*/}  
                    <Text style={[styles.description, {fontSize: 14}]}>
                        {item.meta}
                    </Text>

                    {/*contributors*/}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between',}}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.author}>Built by  </Text>
                            {item.contributors.map((result, i, arr) => {
                                return <Image
                                    key={i}
                                    style={{width: 22, height: 22,margin:2}}
                                    source={{uri: arr[i]}}
                                />
                             })
                            }
                        </View>

                        {/*收藏按钮*/}
                        <TouchableHighlight
                            style={{padding:6}}
                            onPress={()=>this.onPressFavorite()} underlayColor='transparent'>
                            <Image
                                ref='favoriteIcon'
                                style={[{width: 22, height: 22,},this.props.theme.styles.tabBarSelectedIcon]}
                                source={this.state.favoriteIcon}/>
                        </TouchableHighlight>
                    </View>
                </View>
            </TouchableElement>
        );
    }
}


var styles = StyleSheet.create({
    title: {
        fontSize: 16,
        marginBottom: 2,
        color: '#212121'
    },
    description: {
        fontSize: 14,
        marginBottom: 2,
        color: '#757575'
    },
    author: {
        fontSize: 14,
        marginBottom: 2,
        color: '#757575'
    },
});

