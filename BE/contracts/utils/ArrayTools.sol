// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ArrayTools {
    function removeValue(uint256[] storage array, uint256 value) internal {
        for( uint i = 0; i < array.length; i++ ){
            if( array[i] == value){
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    function contains(uint256[] storage array, uint256 value) internal view returns (bool) {
        for( uint i = 0; i < array.length; i++ ){
            if( array[i] == value){
                return true;
            }
        }
        return false;
    }
}