import React, { FunctionComponent, ChangeEvent } from 'react';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import { Title, FilterBox, InputBox, HeaderContainer, ButtonAndSearchContainer, SubTitle, LeftSideComponentsContainer, RightSideComponentsContainer } from './styles';
import { HeaderWithSearchProps, HeaderProps, HeaderWithSelectProps } from './interfaces';

const getTitleContainer = (isSubtitle: boolean | undefined) => isSubtitle ? SubTitle : Title;

export const HeaderWithButtons: FunctionComponent<HeaderProps> = ({ title, children, isSubtitle }) => {
    const TitleContainer = getTitleContainer(isSubtitle);
    return <HeaderContainer>
        <LeftSideComponentsContainer>
            <TitleContainer>{title}</TitleContainer>
        </LeftSideComponentsContainer>
        {children && <ButtonAndSearchContainer>{children}</ButtonAndSearchContainer>}
    </HeaderContainer>
};

export const HeaderWithSelector: FunctionComponent<HeaderWithSelectProps> = ({ title, isSubtitle, children, leftSideComponents }) => {
    const TitleContainer = getTitleContainer(isSubtitle);
    return <HeaderContainer>
        <LeftSideComponentsContainer>
            <TitleContainer>{title} </TitleContainer>{leftSideComponents}
        </LeftSideComponentsContainer>
        <RightSideComponentsContainer>
            {children && <ButtonAndSearchContainer>{children}</ButtonAndSearchContainer>}
        </RightSideComponentsContainer>
    </HeaderContainer>
};

export const HeaderWithSearch: FunctionComponent<HeaderWithSearchProps> = ({ title, onSearch, searchValue, leftSideComponents, children, isSubtitle }) => {
    const TitleContainer = getTitleContainer(isSubtitle);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };
    return <HeaderContainer>
        <LeftSideComponentsContainer>
            <TitleContainer>{title}</TitleContainer>
            {leftSideComponents}
        </LeftSideComponentsContainer>
        <ButtonAndSearchContainer>
            <FilterBox>
                <InputBox type="text" placeholder="Filter" value={searchValue} onChange={handleChange} />
                <SearchOutlinedIcon />
            </FilterBox>
            {children}
        </ButtonAndSearchContainer>
    </HeaderContainer>
};

export default HeaderWithButtons;