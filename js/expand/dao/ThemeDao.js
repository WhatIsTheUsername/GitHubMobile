/**
 * ThemeDao
 * @flow
 */
'use strict';

import {
    AsyncStorage,
} from 'react-native';
import ThemeFactory, {ThemeFlags} from '../../../res/styles/ThemeFactory'
const THEME_KEY = 'theme_key'

export default class ThemeDao {
    getTheme() {
        return new Promise((resolve, reject)=> {
            //从数据缓存中获取主题颜色
            AsyncStorage.getItem(THEME_KEY, (error, result)=> {
                if (error) {  //获取出错
                    reject(error);  //返回error
                    return;
                }
                if (!result) {   //不存在缓存的颜色
                    this.save(ThemeFlags.Default);  //缓存默认颜色
                    result = ThemeFlags.Default;  //设置默认颜色为结果
                }
                resolve(ThemeFactory.createTheme(result));  //返回默认颜色对应的style
            });
        });
    }

    //缓存主题颜色
    save(themeFlag) {
        AsyncStorage.setItem(THEME_KEY, themeFlag, (error, result)=> {

        });
    }
}