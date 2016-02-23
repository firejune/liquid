import Alert from './Alert';
import Anchor from './Anchor';
import Article from './Article';
import Aside from './Aside';
import Badge from './Badge';
import Blockquote from './Blockquote';
import BlockquoteFooter from './BlockquoteFooter';
import Body from './Body';
import Breadcrumbs from './Breadcrumbs';
import BreadcrumbsItem from './BreadcrumbsItem';
import Button from './Button';
import ButtonGroup from './ButtonGroup';
import ButtonToolbar from './ButtonToolbar';
import Caption from './Caption';
import Caret from './Caret';
import Carousel from './Carousel';
import CarouselControls from './CarouselControls';
import CarouselControlNext from './CarouselControlNext';
import CarouselControlPrevious from './CarouselControlPrevious';
import CarouselSlide from './CarouselSlide';
import CarouselSlides from './CarouselSlides';
import CarouselCaption from './CarouselCaption';
import CarouselIndicators from './CarouselIndicators';
import CheckboxHolder from './CheckboxHolder';
import Clearfix from './Clearfix';
import Close from './Close';
import Column from './Column';
import Container from './Container';
import Div from './Div';
import Dropdown from './Dropdown';
import DropdownDivider from './DropdownDivider';
import DropdownHeader from './DropdownHeader';
import DropdownMenuItem from './DropdownMenuItem';
import FieldLabel from './FieldLabel';
import Figure from './Figure';
import Figcaption from './Figcaption';
import Footer from './Footer';
import Form from './Form';
import FormControlFeedback from './FormControlFeedback';
import FormGroup from './FormGroup';
import Heading from './Heading';
import Header from './Header';
import HelpTextBlock from './HelpTextBlock';
import Hgroup from './Hgroup';
import Hr from './Hr';
import HTML from './HTML';
import Icon from './Icon';
import Image from './Image';
import InlineCharacter from './InlineCharacter';
import InlineWrapper from './InlineWrapper';
import InputCheckbox from './InputCheckbox';
import InputColor from './InputColor';
import InputDateAndTime from './InputDateAndTime';
import InputEmail from './InputEmail';
import InputFile from './InputFile';
import InputGroup from './InputGroup';
import InputGroupAddonLeft from './InputGroupAddonLeft';
import InputGroupAddonRight from './InputGroupAddonRight';
import InputHidden from './InputHidden';
import InputNumber from './InputNumber';
import InputPassword from './InputPassword';
import InputRadio from './InputRadio';
import InputRange from './InputRange';
import InputSearch from './InputSearch';
import Select from './Select';
import InputTel from './InputTel';
import InputText from './InputText';
import InputTextarea from './InputTextarea';
import InputURL from './InputURL';
import Jumbotron from './Jumbotron';
import Label from './Label';
import List from './List';
import ListGroup from './ListGroup';
import ListGroupItem from './ListGroupItem';
import ListItem from './ListItem';
import Media from './Media';
import MediaBody from './MediaBody';
import MediaLeft from './MediaLeft';
import MediaRight from './MediaRight';
import Nav from './Nav';
import NavBar from './NavBar';
import NavBarBrand from './NavBarBrand';
import NavBarToggle from './NavBarToggle';
import NavItem from './NavItem';
import PageHeader from './PageHeader';
import Pager from './Pager';
import PagerItem from './PagerItem';
import PagerItemLeft from './PagerItemLeft';
import PagerItemRight from './PagerItemRight';
import Pagination from './Pagination';
import PaginationItem from './PaginationItem';
import Panel from './Panel';
import PanelBody from './PanelBody';
import PanelFooter from './PanelFooter';
import PanelHeading from './PanelHeading';
import Paragraph from './Paragraph';
import ProgressBar from './ProgressBar';
import RadioHolder from './RadioHolder';
import ResponsiveEmbed from './ResponsiveEmbed';
import Row from './Row';
import Section from './Section';
import Small from './Small';
import Span from './Span';
import SplitButton from './SplitButton';
import StaticControl from './StaticControl';
import Table from './Table';
import TableBody from './TableBody';
import TableCell from './TableCell';
import TableFooter from './TableFooter';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import Thumbnail from './Thumbnail';
import Well from './Well';

const all = {
  Alert,
  Anchor,
  Article,
  Aside,
  Badge,
  Blockquote,
  BlockquoteFooter,
  Body,
  Breadcrumbs,
  BreadcrumbsItem,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Caption,
  Caret,
  Carousel,
  CarouselControls,
  CarouselControlNext,
  CarouselControlPrevious,
  CarouselSlide,
  CarouselSlides,
  CarouselCaption,
  CarouselIndicators,
  CheckboxHolder,
  Clearfix,
  Close,
  Column,
  Container,
  Div,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownMenuItem,
  FieldLabel,
  Figure,
  Figcaption,
  Footer,
  Form,
  FormControlFeedback,
  FormGroup,
  Heading,
  Header,
  HelpTextBlock,
  Hgroup,
  Hr,
  HTML,
  Icon,
  Image,
  InlineCharacter,
  InlineWrapper,
  InputCheckbox,
  InputColor,
  InputDateAndTime,
  InputEmail,
  InputFile,
  InputGroup,
  InputGroupAddonLeft,
  InputGroupAddonRight,
  InputHidden,
  InputNumber,
  InputPassword,
  InputRadio,
  InputRange,
  InputSearch,
  Select,
  InputTel,
  InputText,
  InputTextarea,
  InputURL,
  Jumbotron,
  Label,
  List,
  ListGroup,
  ListGroupItem,
  ListItem,
  Media,
  MediaBody,
  MediaLeft,
  MediaRight,
  Nav,
  NavBar,
  NavBarBrand,
  NavBarToggle,
  NavItem,
  PageHeader,
  Pager,
  PagerItem,
  PagerItemLeft,
  PagerItemRight,
  Pagination,
  PaginationItem,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeading,
  Paragraph,
  ProgressBar,
  RadioHolder,
  ResponsiveEmbed,
  Row,
  Section,
  Small,
  Span,
  SplitButton,
  StaticControl,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
  Thumbnail,
  Well
};

const studio = {
  Text: [all.Heading, all.Paragraph, all.Alert, all.Blockquote, all.Small, all.Span],
  Image: [all.Image, all.Icon, all.Carousel, all.Figure, all.Figcaption],
  Controls: [
    all.Button, all.SplitButton, all.ButtonGroup, all.ButtonToolbar, all.Dropdown, all.Anchor
  ],
  Grid: [all.Row, all.Column, all.Clearfix],
  Containers: [
    all.Container, all.Panel, all.ListGroup, all.ListGroupItem, all.Media, all.Jumbotron,
    all.Thumbnail, all.Well, all.List, all.ListItem, all.Div
  ],
  Page: [
    all.NavBar, all.Nav, all.NavItem, all.PageHeader, all.Header, all.Footer, all.Hgroup,
    all.Section, all.Article, all.Aside
  ],
  Pagination: [all.Pagination, all.PaginationItem, all.Pager],
  Table: [all.Table, all.TableRow, all.TableCell],
  Form: [
    all.Form, all.FormGroup, all.FormControlFeedback, all.FieldLabel, all.InputText,
    all.InputEmail, all.InputColor, all.Select, all.InputTel, all.InputDateAndTime, all.InputNumber,
    all.InputRange, all.InputHidden, all.InputURL, all.InputSearch, all.InputPassword,
    all.InputFile, all.InputCheckbox, all.CheckboxHolder, all.InputRadio, all.RadioHolder,
    all.StaticControl, all.InputTextarea, all.HelpTextBlock, all.InputGroup
  ],
  Misc: [
    all.Badge, all.Label, all.Caret, all.Close, all.Breadcrumbs, all.BreadcrumbsItem, all.Hr,
    all.ResponsiveEmbed, all.ProgressBar
  ]
};

export default { all, studio };
